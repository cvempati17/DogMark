import mammoth
import os
import sys

if sys.platform == "win32":
    import win32com.client as win32
    import pythoncom

def convert_docx_to_md(file_path, output_dir=None):
    """
    Converts .docx to markdown using mammoth.
    If output_dir is provided, images are extracted to output_dir/images.
    """
    with open(file_path, "rb") as docx_file:
        if output_dir:
            images_dir = os.path.join(output_dir, "images")
            os.makedirs(images_dir, exist_ok=True)
            
            def convert_image(image):
                # Generate unique filename for image
                image_filename = f"{image.content_type.split('/')[-1]}_{os.urandom(4).hex()}.{image.content_type.split('/')[-1]}"
                image_path = os.path.join(images_dir, image_filename)
                
                with open(image_path, "wb") as image_file:
                    with image.open() as image_stream:
                        image_file.write(image_stream.read())
                
                return {"src": f"images/{image_filename}"}

            result = mammoth.convert_to_markdown(docx_file, convert_image=mammoth.images.img_element(convert_image))
        else:
            # Strip images if no output dir (legacy behavior)
            result = mammoth.convert_to_markdown(docx_file, convert_image=lambda image: [])
            
        return result.value

def convert_doc_to_md(file_path, output_dir=None):
    """Converts .doc to markdown using win32com (requires Word installed)."""
    if sys.platform != "win32":
        raise Exception("Conversion of .doc files is only supported on Windows servers with Microsoft Word installed.")

    try:
        # Initialize COM library
        pythoncom.CoInitialize()
        
        word = win32.DispatchEx("Word.Application")
        word.Visible = False
        
        # Open .doc file
        abs_path = os.path.abspath(file_path)
        doc = word.Documents.Open(abs_path)
        
        # Save as .docx
        docx_path = abs_path + "x"
        doc.SaveAs2(docx_path, FileFormat=16) # 16 is wdFormatXMLDocument
        doc.Close()
        word.Quit()
        
        # Convert the generated .docx
        return convert_docx_to_md(docx_path, output_dir)
        
    except Exception as e:
        print(f"Error converting .doc: {e}")
        raise e
    finally:
        pythoncom.CoUninitialize()
