# Comfy Image Workshop

## Newest Features:
* To fill in later

## Getting Started

First you need to install [ComfyUI](https://github.com/comfyanonymous/ComfyUI). Follow the installation instructions on their github page. 

If you are on Windows and have an Nvidia GPU then download this.

### [Direct link to download](https://github.com/comfyanonymous/ComfyUI/releases/download/latest/ComfyUI_windows_portable_nvidia_cu121_or_cpu.7z)

Next, download my github repository in your root user directory. Open git bash

	git clone https://github.com/Jordain/Comfy_Image_Workshop.git

Next, change directory to C:\Users\%username%\Comfy_Image_Workshop then crtl + shift + left click and select open with PowerShell or CMD. Then run the following two commands

	python -m venv venv

	.\.venv\Scripts\activate

Next, install all library requirements

	pip install -r requirements.txt

If you want to be able to access CIW from other devices in your network, then in the ComfyUI root directory right click on run_nvidia_gpu.bat open in notepad and copy and paste this overtop of what is already there.

	.\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build --listen
	pause

Save and close notepad. 

To run CIW. First start your ComfyUI server by clicking on run_nvidia_gpu.bat in the root directory. 

Second, open the directory where you have installed CIW and open powershell or CMD. Copy and paste this:

	.\.venv\Scripts\activate

    python run.py

Note that this assumes your ComfyUI instance is using port 8188. If not, replace 8188 with the correct port number.

Finally, open http://127.0.0.1:5000/ in your browser to start using CIW. If you change the port to 8188 in the URL you will be redirected to ComfyUI.


Any iamges you download you can drag into comfyUI and see the workflow.

## How To Use

Update this later


## For other help parts

Next, download the [Proteus V0.3](https://huggingface.co/dataautogpt3/ProteusV0.3/resolve/main/ProteusV0.3.safetensors?download=true) model file and place it in the ComfyUI/models/checkpoints directory.

Next, download the [SDXL LCM Lora](https://huggingface.co/latent-consistency/lcm-lora-sdxl/resolve/main/pytorch_lora_weights.safetensors?download=true) model file and place it in the ComfyUI/models/loras directory.

Next, download the [ComfyUI Manger](https://github.com/ltdrdata/ComfyUI-Manager) and follow Installation"[method2]"

Open up Comfyui and download the ComfyUI Essentials extension. You can install it from the Manager.