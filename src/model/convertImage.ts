import { App, TFile} from "obsidian";

async function convert_image_to_blob(img_blob: Blob, convertType: string, convertQuality: Number): Promise<any> {
    return new Promise(async (resolve, reject) => {
        console.log("run")
        const imgURL = URL.createObjectURL(img_blob);
        const image = new Image();
        image.onload = () =>  {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext('2d');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            
            if (context) {
                let type = "image/";
                if (convertType == "jpg")
                    type += "jpeg";
                else
                    type += convertType;

                context.save();
                context.drawImage(image, 0, 0);
                context.restore();
                canvas.toBlob((e) => { 
                    if (e) resolve(e);
                    else resolve(null);	
                }, type , convertQuality);					
            }

            URL.revokeObjectURL(imgURL);	
        };

        image.src = imgURL;		
    })
}

export async function convert_file(app: App, file: TFile, convertType: string, convertQuality: Number): Promise<boolean> {
    const binary = await app.vault.readBinary(file);
    const img_blob = new Blob([binary], { type: `image/${file.extension}` });
    const convert_blob = await convert_image_to_blob(img_blob, convertType, convertQuality);

    if (convert_blob != null) {
        await app.vault.modifyBinary(file, await convert_blob.arrayBuffer())
        return true;
    }

    return false;
}






