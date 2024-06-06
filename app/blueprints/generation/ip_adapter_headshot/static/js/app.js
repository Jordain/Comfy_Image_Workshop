(async (window, d, undefined) => {
    const _ = (selector, contex=d) => contex.querySelector(selector);

    let startTime;
    function timerStart() { startTime = new Date(); }
    function elapsedTime() { if (!startTime) return 0; return (new Date() - startTime) / 1000; }

    function seed () { return Math.floor(Math.random() * 9999999999); }

    function toggleDisplay(el, value=null) {
        if (value !== null) {
            el.style.display = (value === true) ? '' : 'none';
            return;
        }

        el.style.display = (el.style.display === 'none') ? '' : 'none';
    }

    // Seeded random number generator
    function seededRandom(a) {
        return function() {
          a |= 0; a = a + 0x9e3779b9 | 0;
          var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
              t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
          return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
        }
    }

    // UUID generator
    function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }

    // Preload all API workflows
    async function load_api_workflows() {
        let wf = {
            'invert': '/generation/ip_adapter_headshot/static/js/invert.json',
            'ipadapter_ideal_faceid': '/generation/ip_adapter_headshot/static/js/ipadapter_ideal_faceid.json',
        }

        for (let key in wf) {
            let response = await fetch(wf[key]);
            wf[key] = await response.json();
        }

        return wf;
    }
    const workflows = await load_api_workflows();



    // Define local_ip as a global variable
    const local_ip = await get_local_ip();

    // Get the the installed Checkpoints    
    async function get_checkpoints() {
        let response = await fetch('http://' + local_ip + ':8188/object_info/CheckpointLoaderSimple', {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        response = await response.json();
        let checkpoints = response['CheckpointLoaderSimple']['input']['required']['ckpt_name'][0];
        const checkpoints_regex = {
            'DreamShaperXLTurboV2': /.*dreamshaper.*xl.*turbo.*v2.*\.safetensors$/gi,
            'ProteusV0.3': /.*proteus.*0\.3.*\.safetensors$/gi,
        };
        let available_checkpoints = {};
    
        for (let key in checkpoints_regex) {
            available_checkpoints[key] = '';

            checkpoints.forEach(ckpt => {
                if (checkpoints_regex[key].test(ckpt)) {
                    available_checkpoints[key] = ckpt;
                }
            });
        }

        return available_checkpoints;
    };
    const available_checkpoints = await get_checkpoints();

    const positive_template = "Closeup of a {{GENDER}} wearing a {{CLOTHES_DESCRIPTION}} {{PATTERN}} {{COLOR}} {{MATERIAL}} {{CLOTHES}} in a {{BACKGROUND}}. {{MOOD}}, {{TIME}}, {{SEASON}}, high quality, detailed, {{LIGHT}}";

    // Queue a prompt
    async function queue_prompt(endpoint, payload, handler) {
        console.log("payload ", payload);
        console.log("payload JSON ",JSON.stringify(payload));
        fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
            .then((response) => response.json())
            .then((data) => {
              handler(endpoint, data);
            }).catch((e) => console.error(e));
    }

    // Interrupt the generation
    async function interrupt() {
        const response = await fetch('/interrupt', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/html'
            },
        });

        //return await response.json();
    }

    const client_id = uuidv4();
    const server_address = window.location.hostname + ':' + 8188;

    // Current status
    let IS_GENERATING = false;

    // Image Load
    var imageFilename = (imageFilename === '') ? '' : imageFilename;
    // HTML elements
    const roll = _('#roll');
    const roll_icon = _('#roll-icon');
    const progressbar = _('#main-progress');
    const seed_input = _('#main-seed');
    const is_random_input = _('#is-random');
    const spinner = _('#main-spinner');
    const modal = _('#app-modal');
    const results = _('#results');

    const quality_input = _('#quality-input');
    const batch_size_input = _('#batch-size-input');
    let gender_input = document.querySelector('input[name="gender"]:checked').value;
    const clothes_description_input = _('#clothes-description-input');
    const pattern_input = _('#pattern-input');
    const color_input = _('#color-input');
    const material_input = _('#material-input');
    const clothes_input = _('#clothes-input');
    const background_input = _('#background-input');
    const mood_input = _('#mood-input');
    const time_input = _('#time-input');
    const season_input = _('#season-input');
    const light_input = _('#light-input');
    const custom_input = _('#custom-input');
    
    function updateProgress(max=0, value=0) { progressbar.max = max; progressbar.value = value; }

    // Event listeners
    roll.addEventListener('click', async (event) => {
        if (IS_GENERATING) {
            await interrupt();
        } else {      
            let wf = structuredClone(workflows['ipadapter_ideal_faceid']);
            let base_steps = 14;        // minimum number of steps
            let step_increment = 14;    // number of steps multiplied by the quality factor
            // let sampler_name = 'dpmpp_2m';
            // let scheduler = 'exponential';
            // let CFG = 6.5;

            let positive = positive_template;
            let gender = document.querySelector('input[name="gender"]:checked').value; 
            let clothes_description = clothes_description_input.options[clothes_description_input.selectedIndex].value;
            let pattern = pattern_input.options[pattern_input.selectedIndex].value;
            let color = color_input.options[color_input.selectedIndex].value;
            let material = material_input.options[material_input.selectedIndex].value;
            let clothes = clothes_input.options[clothes_input.selectedIndex].value;
            let background = background_input.options[background_input.selectedIndex].value;
            let mood = mood_input.options[mood_input.selectedIndex].value;
            let time = time_input.options[time_input.selectedIndex].value;
            let season = season_input.options[season_input.selectedIndex].value;
            let light = light_input.options[light_input.selectedIndex].value;
            let custom_prompt = custom_input.value;

            // seed number
            let rndseed = seed_input.value
            if ( is_random_input.checked ) {
                rndseed = seed();
                seed_input.value = rndseed;
            }
            let localrand = seededRandom(rndseed);
            
            // Gender
            if ( gender == '0') { gender = 'beautiful woman'; }
            else if ( gender == '1' ) { gender = 'handsome man'; }
            positive = positive.replace('{{GENDER}}', gender);    

            //Clothes description
            positive = positive.replace('{{CLOTHES_DESCRIPTION}}', clothes_description);

            //Pattern
            positive = positive.replace('{{PATTERN}}', pattern);

            // Color
            positive = positive.replace('{{COLOR}}', color);

            // Material
            positive = positive.replace('{{MATERIAL}}', material);

            // Clothes
            positive = positive.replace('{{CLOTHES}}', clothes);

            // Background
            positive = positive.replace('{{BACKGROUND}}', background);

            //Mood
            positive = positive.replace('{{MOOD}}', mood);

            //Time
            positive = positive.replace('{{TIME}}', time);

            //Season
            positive = positive.replace('{{SEASON}}', season);

            // Light
            positive = positive.replace('{{LIGHT}}', light);     

            // custom prompt
            if ( custom_prompt !== '' ) {
                positive = custom_prompt
            }

            // // update the workflow with the selected parameters
            // wf['1']['inputs']['ckpt_name'] = available_checkpoints[model];
            // wf['7']['inputs']["sampler_name"] = sampler_name;
            // wf['7']['inputs']["scheduler"] = scheduler;    
            // wf['7']['inputs']['seed'] = rndseed;
            // wf['7']['inputs']['cfg'] = CFG;
            // wf['5']['inputs']['text'] = negative;

            console.log("image_filename:", imageFilename);

            // update wf
            wf['3']['inputs']['steps'] = base_steps + Math.round(quality_input.value * step_increment);
            wf['5']['inputs']['batch_size'] = batch_size_input.value;
            wf['12']['inputs']['image'] = imageFilename;
            wf['3']['inputs']['seed'] = rndseed;
            wf['6']['inputs']['text'] = positive;
            
            timerStart();
            // response = await queue_prompt(wf);
            await queue_prompt('/generation/ip_adapter_headshot/prompt', { prompt: wf, client_id: client_id }, (endpoint, response) => {
                if (response.error) {
                    addToast(
                      "<u>Oops</u>",
                      response.error.message,
                      (is_error = true),
                      (timeout = 0)
                    );
                    let node_errors = response.node_errors;
                    if (node_errors) {
                      let node;
                      for (var node_id in node_errors) {
                        node = node_errors[node_id];
                        // console.log(node);
                        let class_type = node.class_type;
                        let errors = node.errors;
                        for (var eid in errors) {
                          // console.log(errors[eid].message);
                          // console.log(errors[eid].details);
                          addToast(
                            `<u>Error in ${class_type}</u>`,
                            `${errors[eid].message}, ${errors[eid].details}`,
                            (is_error = true),
                            (timeout = 0)
                          );
                        }
                      }
                    }
                  }
                  if (response.prompt_id) {
                    addToast("Success!", "The prompt was queued succesfully.");
                    // globalState.promptID = response.prompt_id;
                    // console.log("prompt_id = ", globalState.promptID);
                  }
                }
              );

            wf = null;

            if ('error' in response) {
                IS_GENERATING = false;
                toggleDisplay(spinner, IS_GENERATING)
                toggleDisplay(roll_icon, !IS_GENERATING)
                updateProgress();
                _('#modal-message').innerHTML = response['error']['message'];
                UIkit.modal(modal).show();
                console.log('Error: ' + response['error']['message']);
            }
        }
    });

    // Save prompt
    document.getElementById('save').addEventListener('click', async (event) => {
        
        let wf = structuredClone(workflows['ipadapter_ideal_faceid']);
        let base_steps = 14;        // minimum number of steps
        let step_increment = 14;    // number of steps multiplied by the quality factor
        // let sampler_name = 'dpmpp_2m';
        // let scheduler = 'exponential';
        // let CFG = 6.5;

        let positive = positive_template;
        let gender = _('#gender-input:checked').value;
        let clothes_description = clothes_description_input.options[clothes_description_input.selectedIndex].value;
        let pattern = pattern_input.options[pattern_input.selectedIndex].value;
        let color = color_input.options[color_input.selectedIndex].value;
        let material = material_input.options[material_input.selectedIndex].value;
        let clothes = clothes_input.options[clothes_input.selectedIndex].value;
        let background = background_input.options[background_input.selectedIndex].value;
        let mood = mood_input.options[mood_input.selectedIndex].value;
        let time = time_input.options[time_input.selectedIndex].value;
        let season = season_input.options[season_input.selectedIndex].value;
        let light = light_input.options[light_input.selectedIndex].value;
        let custom_prompt = custom_input.value;

        // seed number
        let rndseed = seed_input.value
        if ( is_random_input.checked ) {
            rndseed = seed();
            seed_input.value = rndseed;
        }
        let localrand = seededRandom(rndseed);
        
        // Gender
        if ( gender == '0') { gender = 'beautiful woman'; }
        else if ( gender == '1' ) { gender = 'handsome man'; }
        positive = positive.replace('{{GENDER}}', gender);    

        //Clothes description
        positive = positive.replace('{{CLOTHES_DESCRIPTION}}', clothes_description);

        //Pattern
        positive = positive.replace('{{PATTERN}}', pattern);

        // Color
        positive = positive.replace('{{COLOR}}', color);

        // Material
        positive = positive.replace('{{MATERIAL}}', material);

        // Clothes
        positive = positive.replace('{{CLOTHES}}', clothes);

        // Background
        positive = positive.replace('{{BACKGROUND}}', background);

        //Mood
        positive = positive.replace('{{MOOD}}', mood);

        //Time
        positive = positive.replace('{{TIME}}', time);

        //Season
        positive = positive.replace('{{SEASON}}', season);

        // Light
        positive = positive.replace('{{LIGHT}}', light);     

        // custom prompt
        if ( custom_prompt !== '' ) {
            positive = custom_prompt
        }

        // // update the workflow with the selected parameters
        // wf['1']['inputs']['ckpt_name'] = available_checkpoints[model];
        // wf['7']['inputs']["sampler_name"] = sampler_name;
        // wf['7']['inputs']["scheduler"] = scheduler;    
        // wf['7']['inputs']['seed'] = rndseed;
        // wf['7']['inputs']['cfg'] = CFG;
        // wf['5']['inputs']['text'] = negative;

        // update wf
        wf['3']['inputs']['steps'] = base_steps + Math.round(quality_input.value * step_increment);
        wf['5']['inputs']['batch_size'] = batch_size_input.value;
        wf['12']['inputs']['image'] = imageFilename;
        wf['3']['inputs']['seed'] = rndseed;
        wf['6']['inputs']['text'] = positive;

        // Organize variables into an object
        const data = {
            quality_input: quality_input.value,
            batch_size_input: batch_size_input.value,
            seed_input: seed_input.value,
            imageFilename: imageFilename,
            clothes_description_input: clothes_description_input.options[clothes_description_input.selectedIndex].value,
            pattern_input: pattern_input.options[pattern_input.selectedIndex].value,
            color_input: color_input.options[color_input.selectedIndex].value,
            material_input: material_input.options[material_input.selectedIndex].value,
            clothes_input: clothes_input.options[clothes_input.selectedIndex].value,
            background_input: background_input.options[background_input.selectedIndex].value,
            mood_input: mood_input.options[mood_input.selectedIndex].value,
            time_input: time_input.options[time_input.selectedIndex].value,
            season_input: season_input.options[season_input.selectedIndex].value,
            light_input: light_input.options[light_input.selectedIndex].value,
            gender_input: _('#gender-input:checked').value,
            custom_input: custom_input.value
        }
        // Convert object to JSON string
        const jsonData = JSON.stringify(data);
        console.log("json" + jsonData);
        var formData = new FormData(document.getElementById('save-form'));

        // Add JSON data to form data
        formData.append('workflow', JSON.stringify({wf: jsonData}));

        formData.forEach(function(value, key){
            console.log(key + ": " + value);
        });

        fetch('/generation/ip_adapter_headshot/save', { 
            method: 'POST', 
            body: formData
            }) 
            .then(response => response.text()) 
            .then(result => { 
            //console.log(result); 
            }) 
            .catch(error => { 
            console.error('Error:', error); 
            }); 
    });

    // Load workflow
    document.getElementById('load-wf').addEventListener('click', () => {
        try {
            var genderRadioButtons = document.getElementsByName('gender');

            // Fetch JSON data from the server
            const selectElement = document.getElementById('load-select');
            const selectedValue = selectElement.value;
            
            console.log("Selected value:", selectedValue);

            const dataObject = JSON.parse(selectedValue);
            console.log("data object", dataObject);

            // Populate form fields with data from JSON
            document.getElementById('quality-input').value = dataObject.quality_input;
            document.getElementById('batch-size-input').value = dataObject.batch_size_input;
            document.getElementById('main-seed').value = dataObject.seed_input;
            imageFilename = dataObject.imageFilename;
            document.getElementById('clothes-description-input').value = dataObject.clothes_description_input;
            document.getElementById('pattern-input').value = dataObject.pattern_input;
            document.getElementById('color-input').value = dataObject.color_input;
            document.getElementById('material-input').value = dataObject.material_input;
            document.getElementById('clothes-input').value = dataObject.clothes_input;
            document.getElementById('background-input').value = dataObject.background_input;
            document.getElementById('mood-input').value = dataObject.mood_input;
            document.getElementById('time-input').value = dataObject.time_input;
            document.getElementById('season-input').value = dataObject.season_input;
            document.getElementById('light-input').value = dataObject.light_input;
            gender_input = document.getElementsByName('gender').value = dataObject.gender_input;
            document.getElementById('custom-input').value = dataObject.custom_input;

            for (var i = 0; i < genderRadioButtons.length; i++) {
                console.log(i);
                console.log("outer", genderRadioButtons[i].value);
                if (genderRadioButtons[i].value === gender_input) {
                    console.log("inner",genderRadioButtons[i].value);
                    genderRadioButtons[i].checked = true;
                    break; // Exit the loop once the correct radio button is found and checked
                }
            }


        } catch (error) {
            console.error('Error loading JSON data:', error);
        }
    });

    // Delete workflow
    document.getElementById('delete-wf').addEventListener('click', () => {
        var selectElement = document.getElementById('load-select');
        var selectedOption = selectElement.options[selectElement.selectedIndex];
        var workflow_Id = selectedOption.id;
        console.log(workflow_Id);
        fetch('/generation/ip_adapter_headshot/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ workflowID: workflow_Id })
        })
        .then(response => response.text())
        .then(result => {
            console.log(result);
            for (var i=0; i<selectElement.length; i++) {
                if (selectElement.options[i].value == selectedOption.value)
                    selectElement.remove(i);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    is_random_input.addEventListener('change', (event) => {
        if (is_random_input.checked) {
            seed_input.disabled = true;
        } else {
            seed_input.disabled = false;
        }
    });

    // WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(protocol + '//' + server_address + '/ws?clientId=' + client_id);
    socket.addEventListener('open', (event) => {
        console.log('Connected to the server');
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        
        if ( data.type === 'progress' ) {
            //IS_GENERATING = true;
            updateProgress(data['data']['max'], data['data']['value']);
        } else if (data.type === 'executed') {
            const execution_time = elapsedTime();
            console.log('Execution time: ' + execution_time + 's');
            if ('images' in data['data']['output']) {
                results.innerHTML = '';
                const images = data['data']['output']['images'];
                const grid = ( images.length > 1 ) ? ' class="uk-width-1-2"' : '';
                for (let i = 0; i < images.length; i++) {
                    const filename = images[i]['filename']
                    const subfolder = images[i]['subfolder']
                    const rand = Math.random();
                    results.innerHTML += '<div' + grid + '><div><a href="/generation/ip_adapter_headshot/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand + '" data-type="image"><img src="/generation/ip_adapter_headshot/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand + '" width="1024" height="1024" alt=""></a></div></div>';
                }
            }
        } else if (data.type === 'execution_interrupted') {
            console.log('Execution Interrupted');
        } else if (data.type === 'status') {
            IS_GENERATING = (data['data']['status']['exec_info']['queue_remaining'] > 0) ? true : false;

            toggleDisplay(spinner, IS_GENERATING)
            toggleDisplay(roll_icon, !IS_GENERATING)
            updateProgress();
        }
    });

    function handleUploadImage(event) {
        event.preventDefault();
        uploadImage();
    }

    document.addEventListener("touchstart", e => {
        console.log(e);
    })
    
    // Get the button element
    const uploadButton = document.getElementById('upload_image_button');
    
    // Add event listeners for click and touch events
    uploadButton.addEventListener('click', handleUploadImage);
    //uploadButton.addEventListener('touchend', handleUploadImage); 

    
    document.getElementById('imageInput').addEventListener('change', function() {
        console.log("imageInput changed");
        var fileInput = document.getElementById('imageInput').files[0];
        displayImage(fileInput);


    });

    
    async function uploadImage() {
        var formData = new FormData();
        var fileInput = document.getElementById('imageInput').files[0];
        formData.append('image', fileInput);
    
        try {
            const response = await fetch('upload_image', {
                method: 'POST',
                body: formData
            });
    
            if(!response.ok) {
                throw new Error("Error uploading image.")
            }
    
            const data = await response.json()
            console.log(data.image_filename)
            imageFilename = data.image_filename
        } catch(err) {
            console.error(reportError)
        }
    }

    function displayImage(file) {
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');

        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = URL.createObjectURL(file);
    }

})(window, document, undefined);

