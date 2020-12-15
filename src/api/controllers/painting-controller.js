const sanitizer = require('sanitizer'); //Module used to sanitize form data
const striptags = require('striptags'); //module used to remove tags of form 
const isBase64 = require('is-base64'); //module used to verify if data is base64 string
const PaintingsModel = require('../models/Paintings'); 


exports.getPaintings = async (req, res, next) => {
    try {

        await PaintingsModel.generateDirectories()

        setTimeout(function(){
            //Call model function getPaintings()
            const result = PaintingsModel.getPaintings();

            // convert result of function to object notation
            const response = JSON.parse(result)

            return res.status(200).send(response);
        }, 50);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};




exports.getPaintingDetail = async (req, res, next)=> {
    try {

        await PaintingsModel.generateDirectories()

        let painting_id = '';

        //varify if id from front-end is valid
        if(req.params.painting_id > 0){
            //sanitize data from form
            painting_id = sanitize(req.params.painting_id);
        }
        else{
            //error message
            return res.status(202).send({error: 'ID not defined'})
        }

        setTimeout(function(){
            //Call model function getPaintingDetail(painting_id)
            const result = PaintingsModel.getPaintingDetail(painting_id);
            
            //if not found register
            if (!result) {
                return res.status(404).send({error: 'painting not found'})
            }

            //format result to show in route
            const response = {
                "data": [
                    {
                        result
                    }
                ]
            }

            return res.status(200).send(response);   
        }, 50);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};



exports.createPainting = async (req, res, next) => {
    try {

        await PaintingsModel.generateDirectories()

        //define object
        newRegisterData = {}

        //GENERATE ID with timestamp
        let d = new Date();
        newRegisterData.painting_id = d.getTime();

        //sanitize all data from form 
        newRegisterData.title = sanitize(req.body.title)
        newRegisterData.description = sanitize(req.body.description)

        newRegisterData.artist = {
            name: sanitize(req.body.artist_name),
            country: sanitize(req.body.artist_country),
            period: sanitize(req.body.artist_period),
        }

        newRegisterData.image = sanitize(req.body.image)

        //verify if data from form is empty
        if(
            isEmpty(newRegisterData.title) ||
            isEmpty(newRegisterData.description) ||
            isEmpty(newRegisterData.artist.name) ||
            isEmpty(newRegisterData.artist.country) ||
            isEmpty(newRegisterData.artist.period) ||
            isEmpty(newRegisterData.image)
        ){
            return res.status(500).send({error: 'blank fields'})
        }


        //verify if base64 string is valid
        if(isBase64(newRegisterData.image, {allowMime: true})){
            //create file with painting_id to generate name and image(base64_string)
            newRegisterData.image = await PaintingsModel.base64ToImage(newRegisterData.painting_id, newRegisterData.image)
        }
        else{
            return res.status(500).send({error: 'base64 image is not valid'})
        }

        setTimeout(function(){

            //verify if this title exists in some register if json file
            if(PaintingsModel.getPaintingByTitle(newRegisterData.title)){
                return res.status(202).send({error: 'This title already exists'}) 
            } 

            //call function to insert data
            const result = PaintingsModel.createPainting(newRegisterData);
            
            //if result is not false, define formated data to send to route
            if(result){

                const link = req.protocol+'://'+req.get('host')+req.originalUrl
                const response = {
                    message: 'Painting created sucessfully',
                    createdPainting: {
                        painting_id: newRegisterData.painting_id,
                        title: newRegisterData.title,
                        description: newRegisterData.description,
                        artist: {
                            name: newRegisterData.artist.name,
                            country: newRegisterData.artist.country,
                            period: newRegisterData.artist.period
                        },
                        image: newRegisterData.image,
                        request: {
                            type: 'GET',
                            description: 'Return all paintings',
                            url: link
                        }
                    }
                }
                return res.status(201).send(response);   
            }

            else{
                return res.status(500).send({ error: 'Error at create painting' });
            }
        }, 50);
        


    } catch (error) {
        return res.status(500).send({ error: error });
    }
};





exports.updatePainting = async (req, res, next) => {

    try {

        let result = false;

        let painting_id = '';

        //verify if id from front-end is valid
        if(req.params.painting_id > 0){
            painting_id = sanitize(req.params.painting_id);
        }
        else{
            return res.status(500).send({error: 'ID not defined'})
        }

        //Verify if registers with this painting_id exists
        const findPainting = await PaintingsModel.getPaintingDetail(painting_id);

        //If register exists
        if(findPainting){
            
            newRegisterData = {}

            newRegisterData.painting_id = findPainting.painting_id;

            // if data from form is equals data from json file

            if(findPainting.title == sanitize(req.body.title)){
                newRegisterData.title = findPainting.title;
            }
            else{
                newRegisterData.title = sanitize(req.body.title);
            }


            if(findPainting.description == sanitize(req.body.description)){
                newRegisterData.description = findPainting.description;
            }
            else{
                newRegisterData.description = sanitize(req.body.description);
            }

  

            if(findPainting.artist.name == sanitize(req.body.artist_name)){
                artist_name = findPainting.artist.name;
            }
            else{
                artist_name = sanitize(req.body.artist_name);
            }

            if(findPainting.artist.country == sanitize(req.body.artist_country)){
                artist_country = findPainting.artist.country;
            }
            else{
                artist_country = sanitize(req.body.artist_country);
            } 

            if(findPainting.artist.period == sanitize(req.body.artist_period)){
                artist_period = findPainting.artist.period;
            }
            else{
                artist_period = sanitize(req.body.artist_period);
            } 


            newRegisterData.artist = {
                name: artist_name,
                country: artist_country,
                period: artist_period
            }

            newRegisterData.image = findPainting.image

            if(
                
                isEmpty(newRegisterData.title) ||
                isEmpty(newRegisterData.description) ||
                isEmpty(newRegisterData.artist.name) ||
                isEmpty(newRegisterData.artist.country) ||
                isEmpty(newRegisterData.artist.period) 
            ){
                return res.status(500).send({error: 'blank fields'})
            }



            if(!isEmpty(sanitize(req.body.image))){

                const newImage = sanitize(req.body.image);

                if(isBase64(newImage, {allowMime: true})){
                   await PaintingsModel.base64ToImage(newRegisterData.painting_id, newImage)
                }
                else{
                    return res.status(500).send({error: 'base64 image is not valid'})
                }

            }


            //call function to Delete current data
            await PaintingsModel.deletePainting(findPainting.painting_id);

            //call function to Insert new data defined previusly
            result = await PaintingsModel.createPainting(newRegisterData);


        }
        else{
            return res.status(404).send({ error: 'Painting with ID '+painting_id+' not found' });
        }


        //if data is sucessfully insertd, send formated data to route
        if(result){
            const link = req.protocol+'://'+req.get('host')+req.originalUrl
            const response = {
                message: 'Painting updated sucessfully',
                updatedPainting: {
                    painting_id: painting_id,
                    title: newRegisterData.title,
                    description: newRegisterData.description,
                    artist: {
                        name: newRegisterData.artist.name,
                        country: newRegisterData.artist.country,
                        period: newRegisterData.artist.period
                    },
                    image: newRegisterData.image,
                    request: {
                        type: 'GET',
                        description: 'Return painting with id '+painting_id,
                        url: link
                    }
                }
            }
            return res.status(200).send(response);   
        }
        else{
            return res.status(500).send({ 'error': 'Error at update painting' });
        }
        


    } catch (error) {
        return res.status(500).send({ error: error });
    }
};





exports.deletePainting = async (req, res, next) => {
    try {

        let painting_id = '';

        if(req.params.painting_id > 0){
            painting_id = sanitize(req.params.painting_id);
        }
        else{
            return res.status(500).send({error: 'ID not defined'})
        }

        //verify id registers exists
        const findPainting = await PaintingsModel.getPaintingDetail(painting_id);
        if(!findPainting){
            return res.status(404).send({ error: 'Painting with ID '+painting_id+' not found' });
        }

        //cal function to delete register
        const result = await PaintingsModel.deletePainting(painting_id);
  

        if(result){
            //call  function to delete image file from server
            await PaintingsModel.removeImageFromServer(painting_id)
            return res.status(200).send({message: 'Painting with ID '+painting_id+' was successfully deleted'});
        }

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};



//function to verify if value(string is empty)
function isEmpty(value) {

    value = String(value);

    //remove all white spaces
    value = value.replace(/\s{2,}/g, '');

    switch (value) {
      case '':
      case null:
      case typeof(value) == "undefined":
        return true;
      default:
        return false;
    }
  }


  //function to sanitize fields
  function sanitize(value){

    //Strip tags and sanitize values
    value = striptags(value)
    value = sanitizer.sanitize(value)
    value = sanitizer.escape(value)
    return value
    
  }