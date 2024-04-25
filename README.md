# Comfy Image Workshop

## Newest Features:
* To fill in later


## Getting Started

First of all make sure you have [ComfyUI](https://github.com/comfyanonymous/ComfyUI) successfully installed and running.

Next, download the [Proteus V0.3](https://huggingface.co/dataautogpt3/ProteusV0.3/resolve/main/ProteusV0.3.safetensors?download=true) model file and place it in the ComfyUI/models/checkpoints directory.

Next, download the [SDXL LCM Lora](https://huggingface.co/latent-consistency/lcm-lora-sdxl/resolve/main/pytorch_lora_weights.safetensors?download=true) model file and place it in the ComfyUI/models/loras directory.

Next, download the [ComfyUI Manger](https://github.com/ltdrdata/ComfyUI-Manager) and follow Installation"[method2]"

Open up Comfyui and download the ComfyUI Essentials extension. You can install it from the Manager.

Next, download my github repository in the root ComfyUI_windows_portable directory. Open git bash

	git clone __placeholderlink__

Next, change directory to __placeholderlink__ open powershell then

	python -m venv venv
	.\venv\Scripts\activate

Next, install all library requirements
	pip install -r requirements.txt
	
Then run comfyUI by to start the GUI, and run powershell from that directory and then run the following command
	.\venv\Scripts\activate
    flask --app 'comfy_character_creator:create_app(8188)' run --port 5001

Note that this assumes your ComfyUI instance is using port 8188. If not, replace 8188 with the correct port number.

Finally, open http://127.0.0.1:5001/port/8188 in your browser to start using the GUI. However change 8188 in the URL to the port used by ComfyUI if it is different.

## How To Use

Update this later
