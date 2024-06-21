# Comfy Image Workshop

## Newest Features:
* To fill in later

## ComfyUI Installation

1. If you are on Windows and have an Nvidia GPU then you can just install the [portable version](https://github.com/comfyanonymous/ComfyUI/releases/download/latest/ComfyUI_windows_portable_nvidia_cu121_or_cpu.7z)

2. If you already have git installed then download [scripts/install-manager-for-portable-version.bat](https://github.com/ltdrdata/ComfyUI-Manager/raw/main/scripts/install-manager-for-portable-version.bat) and place into `"ComfyUI_windows_portable"` directory:

3. Then double click `install-manager-for-portable-version.bat` batch file

## Comfy Image Workshop Installation

1. Install this repo in your root user directory(C:\Users\\%username%). Open command prompt and run the following:
```commandline
	git clone https://github.com/Jordain/Comfy_Image_Workshop.git
```

2. Change directory to Comfy_Image_Workshop:
```commandline
	cd Comfy_Image_Workshop
```

3. Then create a virtual environment:
```commandline
	python -m venv venv
	.\\.venv\Scripts\activate
```

4. Install all dependencies
```commandline
	pip install -r requirements.txt
```

5. Install packages:
```commandline
	npm install
```

6. If you high severity vulnerability issues, then run the following command:
```commandline
	npm audit fix
```

7. Change directory to root app directory:
```commandline
	cd app
```

8. Intialize the db using these three commands
```commandline
	flask db init
	flask db migrate -m "Initial migration"
	flask db upgrade
```

9. To create the tailwindcss output.css file, run the following command:
```commandline
	npx tailwindcss -i ./static/css/input.css -o ./static/css/output.css
```

10. To run Comfy Image Workshop, run the following command:
```commandline
	python run.py
```

11. (Optional) To access CIW from other devices in your network, go to your ComfyUI root directory and right click on run_nvidia_gpu.bat and open in notepad, then copy and paste this overtop of what is already there. Then Save and Close notepad. 
```notepad
	.\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build --listen
	pause
```

12. (Optional) If you plan on running a new instance of ComfyUI specifically for this repo, then you might want to pass all of your checkpoints, models, loras, etc... to the new ComfyUI instance. To do this, open up ComfyUI within the ComfyUI_windows_portable directory and make a copy of extra_model_path.yaml.example and then rename it to extra_model_path.yaml. Then look for where it says comfyUI and paste the code below to replace it. Then change the the base_path to your user profile and change the ComfyUI_windows_portable to the name of your ComfyUI_windows_portable directory that has all of your checkpoints, models, loras, etc... 
```yaml
	comfyui:
     base_path: C:/Users/%USERPROFILE%/ComfyUI_windows_portable/ComfyUI/
     checkpoints: models/checkpoints/
     clip: models/clip/
     clip_vision: models/clip_vision/
     configs: models/configs/
     controlnet: models/controlnet/
     embeddings: models/embeddings/
     loras: models/loras/
     upscale_models: models/upscale_models/
     vae: models/vae/
     ipadapter: models/ipadapter
```

## How to Run Comfy Image Workshop

1. Start your ComfyUI server by clicking on run_nvidia_gpu.bat in the `"ComfyUI_windows_portable"` directory. 

2. Open the directory where you have installed CIW and open powershell or CMD. Copy and paste this:

	.\\.venv\Scripts\activate
    python run.py

Note that this assumes your ComfyUI instance is using port 8188. If not, replace 8188 with the correct port number.

3. Open http://127.0.0.1:5000/ in your browser to start using CIW.

## Tips

- Any iamges you download you can drag into comfyUI and see the workflow.
- If you change the port from 5000 to 8188 in the URL(http://127.0.0.1:5000/) you will be redirected to ComfyUI.

## QA

### Why did you make this?

I completed an online course and this is my final project. I wanted to learn how to integrate ComfyUI within a web application as well as integrate components I learned throughout the course. I expanded the scope of the project to make it easier for people who want to integrate ComfyUI in there code by making the code more modular.

### Who is this for?

Primarily for anyone that wants to learn how to code with ComfyUI and to code their own workflows.

Secondarily for the person hosting CIW to be able to share their workflows with their friends and family within their local network. On any device (computer, phone, tablet, etc)

## TODOS

- [x] Release Comfy Image Workshop.
- [ ] Aligning tooltips in Dress U Up.
- [ ] Update size of input text boxes for smaller screens.
- [ ] Create roles in models, specifically for admin.
- [ ] Make help page only viewable to admins.
- [ ] Safari issue not loading images from Dress U Up on generation.
- [ ] Safari issue with some of the text field boxes not displaying correctly (invisible for passwords instead of •).
- [ ] Review and update interupt functions in Dress U Up and Fantasy Character Creator.
- [ ] Reivew and clean up app.py files.
- [ ] Update seed class to helper class from ip_adapter_headshot app.py
- [x] Add toasts on upload, save and load buttons for Dress U Up and Fantasy Character Creator.
- [ ] Add loading bar on txt gen sd3 app.py
- [x] Fix toast bg error color in toast.js

## Special Thanks

- Brendan for weekly guidance on errors that I ran into
- [Matteo](https://www.youtube.com/watch?v=anYHG37fUg4&t=1031s) for his ComfyUI webapp interface video
- [Mut-ex](https://github.com/mut-ex/gligen-gui) for his Gligen-GUI repo that used flask and helped me undestand how I can intergate ComfyUI with my code
- You 🙂 for viewing this repo and trying it out. 

## Resources

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI). Follow the installation instructions here if you require a custom installation.
- [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager). Follow the installation instructions here if you require a custom installation.
