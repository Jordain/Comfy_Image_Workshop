(async (window, d, undefined) => {
    const _ = (selector, contex=d) => contex.querySelector(selector);
    let startTime;
    function timerStart() { startTime = new Date(); }
    function elapsedTime() { if (!startTime) return 0; return (new Date() - startTime) / 1000; }
    function seed () { return Math.floor(Math.random() * 9999999999); }

    // Toggles Display for the loading wheel on the generate button
    function toggleDisplay(el, value=null) {
        if (value !== null) {
            el.style.display = (value === true) ? '' : 'none';
            return;
        }
        el.style.display = (el.style.display === 'none') ? '' : 'none';
    }

    // UUID generator
    function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }

    // Preload all API workflows
    async function load_api_workflows() {
        let wf = {
            // EDIT7 HERE:
            // Update the path to your json_worfklow file
            // Select ipadapter_ideal_faceid press Ctrl + H the rename to your workflow name then replace all elements in this page.
            // Select ip_adapter_headshot press Ctrl + H the rename to your_new_workflow then replace all elements in this page.
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

    // We don't need to get the checkpoints because it's hardcoded in the json workflow. If we had more than one we would have to. Look at Fantasy Character Generator.

    // Template of the prompt that gets sent to ComfyUI for generation
    const positive_template = "Closeup of a {{GENDER}} wearing a {{CLOTHES_DESCRIPTION}} {{PATTERN}} {{COLOR}} {{MATERIAL}} {{CLOTHES}} in a {{BACKGROUND}}. {{MOOD}}, {{TIME}}, {{SEASON}}, high quality, detailed, {{LIGHT}}";

    // Queue a prompt
    async function queue_prompt(endpoint, payload, handler) {
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

    // getting the value from the HTML elements
    const generate = _('#generate');
    const generate_icon = _('#generate-icon');
    const progressbar = _('#main-progress');
    const seed_input = _('#main-seed');
    const is_random_input = _('#is-random');
    const spinner = _('#main-spinner');
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

    // Need to disable user input on seed on first load
    seed_input.disabled = true;
    
    function updateProgress(max=0, value=0) { progressbar.max = max; progressbar.value = value; }

    // Event listener for clicking the generate button
    generate.addEventListener('click', async (event) => {
        if (IS_GENERATING) {
            await interrupt();
        } else {      
            let wf = structuredClone(workflows['ipadapter_ideal_faceid']);
            let base_steps = 14;        // minimum number of steps
            let step_increment = 14;    // number of steps multiplied by the quality factor
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

            // Updates positive with what's selected on page
            if ( gender == '0') { gender = 'beautiful woman'; }
            else if ( gender == '1' ) { gender = 'handsome man'; }
            positive = positive.replace('{{GENDER}}', gender);    
            positive = positive.replace('{{CLOTHES_DESCRIPTION}}', clothes_description);
            positive = positive.replace('{{PATTERN}}', pattern);
            positive = positive.replace('{{COLOR}}', color);
            positive = positive.replace('{{MATERIAL}}', material);
            positive = positive.replace('{{CLOTHES}}', clothes);
            positive = positive.replace('{{BACKGROUND}}', background);
            positive = positive.replace('{{MOOD}}', mood);
            positive = positive.replace('{{TIME}}', time);
            positive = positive.replace('{{SEASON}}', season);
            positive = positive.replace('{{LIGHT}}', light);     
            // custom prompt
            if ( custom_prompt !== '' ) {
                positive = custom_prompt
            }

            // update workflow
            wf['3']['inputs']['steps'] = base_steps + Math.round(quality_input.value * step_increment);
            wf['5']['inputs']['batch_size'] = batch_size_input.value;
            wf['12']['inputs']['image'] = imageFilename;
            wf['3']['inputs']['seed'] = rndseed;
            wf['6']['inputs']['text'] = positive;
            
            timerStart();
            // Generates the prompt
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
                        let class_type = node.class_type;
                        let errors = node.errors;
                        for (var eid in errors) {
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
                  }
                }
              );
            wf = null;
        }
    });

    // Save prompt
    document.getElementById('save').addEventListener('click', async (event) => {
        
        let wf = structuredClone(workflows['ipadapter_ideal_faceid']);
        let base_steps = 14;        // minimum number of steps
        let step_increment = 14;    // number of steps multiplied by the quality factor
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
        
        // Updates positive with what's selected on page
        if ( gender == '0') { gender = 'beautiful woman'; }
        else if ( gender == '1' ) { gender = 'handsome man'; }
        positive = positive.replace('{{GENDER}}', gender);    
        positive = positive.replace('{{CLOTHES_DESCRIPTION}}', clothes_description);
        positive = positive.replace('{{PATTERN}}', pattern);
        positive = positive.replace('{{COLOR}}', color);
        positive = positive.replace('{{MATERIAL}}', material);
        positive = positive.replace('{{CLOTHES}}', clothes);
        positive = positive.replace('{{BACKGROUND}}', background);
        positive = positive.replace('{{MOOD}}', mood);
        positive = positive.replace('{{TIME}}', time);
        positive = positive.replace('{{SEASON}}', season);
        positive = positive.replace('{{LIGHT}}', light);     
        // custom prompt
        if ( custom_prompt !== '' ) {
            positive = custom_prompt
        }

        // update the workflow with the selected parameters
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
                addToast("Success!", "The prompt was saved succesfully.");
                console.log(result); 
            }) 
            .catch(error => { 
                addToast("Error!", "The prompt did not save succesfully.");
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
            const dataObject = JSON.parse(selectedValue);

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

            // Workaround to set the gender radio button to the correct value
            for (var i = 0; i < genderRadioButtons.length; i++) {
                if (genderRadioButtons[i].value === gender_input) {
                    genderRadioButtons[i].checked = true;
                    break;
                }
            }
            
            addToast("Success!", "The workflow was loaded succesfully.");

        } catch (error) {
            addToast("Error!", "Error loading JSON data:", error);
            console.error('Error loading JSON data:', error);
        }
    });

    // Disable seed input if is_random is checked in Generation Parameters
    is_random_input.addEventListener('change', (event) => {
        if (is_random_input.checked) {
            seed_input.disabled = true;
        } else {
            seed_input.disabled = false;
        }
    });

    // Delete workflow
    document.getElementById('delete-wf').addEventListener('click', () => {
        var selectElement = document.getElementById('load-select');
        var selectedIndex = selectElement.selectedIndex;
        var selectedOption = selectElement.options[selectedIndex];
        var workflowId = selectedOption.id;
        
        fetch('/generation/ip_adapter_headshot/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ workflowID: workflowId })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Determine the new selected index
                let newSelectedIndex = selectedIndex;
                if (selectedIndex === selectElement.options.length - 1) {
                    newSelectedIndex = selectedIndex - 1;
                }
                
                // Remove the option from the select element
                selectElement.remove(selectedIndex);
                
                // Update the selected index
                if (selectElement.options.length > 0) {
                    selectElement.selectedIndex = newSelectedIndex;
                }
                
                addToast("Success!", "The workflow was deleted succesfully.");
                console.log(`Workflow with ID ${workflowId} deleted successfully.`);
            } else {
                addToast("Error!", "Failed to delete workflow.");
                console.error('Failed to delete workflow.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
                    console.log("results",);
                    results.innerHTML += '<div' + grid + '><div><a href="/generation/ip_adapter_headshot/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand + '" data-type="image"><img src="/generation/ip_adapter_headshot/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand + '" width="1024" height="1024" alt=""></a></div></div>';
                }
            }
        } else if (data.type === 'execution_interrupted') {
            console.log('Execution Interrupted');
        } else if (data.type === 'status') {
            IS_GENERATING = (data['data']['status']['exec_info']['queue_remaining'] > 0) ? true : false;

            toggleDisplay(spinner, IS_GENERATING)
            toggleDisplay(generate_icon, !IS_GENERATING)
            updateProgress();
        }
    });

    function handleUploadImage(event) {
        event.preventDefault();
        uploadImage();
    }
    
    const uploadButton = document.getElementById('upload_image_button');
    
    // Listens for click on upload button in Upload Face Portrait page
    uploadButton.addEventListener('click', handleUploadImage);

    document.getElementById('imageInput').addEventListener('change', function() {
        var fileInput = document.getElementById('imageInput').files[0];
        displayImage(fileInput);
    });

    // Uploads image to comfyUI input dir
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
                addToast("Error!", "Error uploading image.");
                throw new Error("Error uploading image.")
            }
            const data = await response.json()
            imageFilename = data.image_filename
            addToast("Success!", "The image was uploaded succesfully.");
        } catch(err) {
            console.error(reportError)
        }
    }

    // Displays image in canvas
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

