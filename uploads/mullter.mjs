import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({

    destination:function(req,file,cd){
        
    }
})