(async (window, document, undefined) => {

    // UUID generator
    function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
    const client_id = uuidv4();
    console.log("c ", client_id);
    // Load the workflow
    async function loadWorkflow() {
        const response = await fetch('workflow.json'); 
        return await response.json();
    }
    const workflow = await loadWorkflow();

    console.log(workflow);

    // WebSocket
    const server_address = window.location.hostname + ':' + 8188;
    const socket = new WebSocket('ws://' + server_address + '/ws?clientId=' + client_id);
    socket.addEventListener('open', (event) => {
        console.log('Connected to the server');
    });

    socket.addEventListener('message', (event) => {
        
        const data = JSON.parse(event.data);
        console.log("event ", event);
        console.log("socket message ", data);
        //console.log("socket ", data);
        if (data.type === 'executed') {
            console.log("socket in", data);
            if ('images' in data['data']['output']) {
                const image = data['data']['output']['images'][0];
                const filename = image['filename']
                const subfolder = image['subfolder']
                const rand = Math.random();

                _maingen.src = '/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand
            }
        }
    });

    const _maingen = document.getElementById('maingen');
    console.log("maingen ", _maingen);

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

    const _prompt = document.getElementById('prompt');
    const _cfgrescale = document.getElementById('cfgrescale');
    let cachedPrompt = _prompt.value;
    let lastExecutedPrompt = null;

    async function checkPrompt () {
        const currentPrompt = _prompt.value;
        clearTimeout(promptTimeout);

        if ( currentPrompt.length < 2 || currentPrompt != cachedPrompt ) {
            cachedPrompt = currentPrompt;
            promptTimeout = setTimeout(checkPrompt, 360);
            return;
        }

        workflow["6"]["inputs"]["text"] = currentPrompt.replace(/(\r\n|\n|\r)/gm, " ");
        workflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 9999999999);

        if ( _cfgrescale.checked ) {
            workflow["3"]["inputs"]["model"][0] = "11";
            workflow["3"]["inputs"]["cfg"] = 2.8;
        } else {
            workflow["3"]["inputs"]["model"][0] = "10";
            workflow["3"]["inputs"]["cfg"] = 2.1;
        }

        if ( lastExecutedPrompt !== currentPrompt ) {
            await queue_prompt('/prompt', { prompt: workflow, client_id: client_id }, (endpoint, response) => {
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
                    globalState.promptID = response.prompt_id;
                    console.log("prompt_id = ", globalState.promptID);
                  }
                }
              );
            lastExecutedPrompt = currentPrompt;
        }

        promptTimeout = setTimeout(checkPrompt, 360);
    }
    let promptTimeout = setTimeout(checkPrompt, 1);
})(window, document, undefined);
