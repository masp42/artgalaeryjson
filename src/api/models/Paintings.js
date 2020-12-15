const fs = require('fs') //require file system nodeJs module

const paintingsJsonFile = 'src/api/json/paintings.json'; //Define path tp json file

//model to get all registers
exports.getPaintings = function() {
    try {

        //file system function to read json file
        const jsonData = fs.readFileSync(paintingsJsonFile)
        return jsonData;
        
    } catch(error){
        console.log(error);
        return false
    }
};


//model to get one register by property id
exports.getPaintingDetail = function(painting_id) {
    try {

        let jsonData = fs.readFileSync(paintingsJsonFile)

        //convert json data to javascript object notation
        jsonData = (JSON.parse(jsonData)).data

        //Get register from object where value of property id is equals to function id
        jsonData = jsonData.find( item => item.painting_id == painting_id )

        return jsonData;
    
    } catch(error){
        console.log(error);
        return false
    }
}



//model to get one register by property title
exports.getPaintingByTitle = function(title) {
    try {

        let jsonData = fs.readFileSync(paintingsJsonFile)
        jsonData = (JSON.parse(jsonData)).data
        jsonData = jsonData.find( item => item.title == title )

        if(jsonData){
            return true
        }
        else{
            return false
        }
    
    } catch(error){
        console.log(error);
        return false
    }
}



//model to insert register with object send from form
exports.createPainting = function(newRegisterData) {
    try {
        //convert JSON to object javascript
        let allRegistersData = JSON.parse(this.getPaintings())


        allRegistersData = allRegistersData.data

        //push new data to object with all registers
        allRegistersData.push(newRegisterData)

        //convert to json notation and write new data in json file 
        fs.writeFileSync(paintingsJsonFile, JSON.stringify({"data": allRegistersData}))
        return true
   
    } catch(error){
        console.log(error);
        return false
    }
}


//model to delete one register by id
exports.deletePainting = function(painting_id) {
    try {

        //Get all registers and convert to object javascript
        let allRegistersData = JSON.parse(this.getPaintings())
        allRegistersData = allRegistersData.data

        //Filter function remove register in object where object painting_id is equals painting_id passed in function
        const registeredDataWithoutDeleted = allRegistersData.filter( item => item.painting_id != painting_id )

        //write nnew data without register filtered
        fs.writeFileSync(paintingsJsonFile, JSON.stringify({"data": registeredDataWithoutDeleted}))
        return true        

    } catch(error){
        console.log(error);
        return false
    }
}



//function to convert base64 string to image file
exports.base64ToImage = function(fileName, base64String) {

    //remove parts of base 64 string is not used
    let base64Image = base64String.split(';base64,').pop();

    //Define filename and extension
    fileName = fileName+'.jpg'

    //path to save converted file
    const pathToSave = 'src/api/uploads/'+fileName

    try{
        //write base64 string to file and save in defined path
        fs.writeFile(pathToSave, base64Image, {encoding: 'base64'}, function() {})
        return fileName

    }catch(error){
        console.log(error);
        return false
    }
    
}



//function to delete image file in server
exports.removeImageFromServer = function(fileName) {

    //path to delete file
    filePath = 'src/api/uploads/'+fileName+'.jpg'

    try{
        //file system function to delete file
        fs.unlinkSync(filePath)
        return true
    }catch(error){
        console.log(error);
        return false
    }
    
}


//Generate JSON file and folder uploads if not exists
exports.generateDirectories = function(){

    //generate folder uploads if not exists
    if (!fs.existsSync('src/api/uploads/')){
        fs.mkdirSync('src/api/uploads/');
    }

    const dir = 'src/api/json/';
    const file = 'paintings.json';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    //generate JSON files if not exists
    if (!fs.existsSync(dir+file)){
        fs.appendFile(dir+file, '{"data": []}', function (err) {
            if (err) throw err;
        });
    

        return true
    }
}