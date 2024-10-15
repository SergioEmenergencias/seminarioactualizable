const Publics = require('../Models/Posting');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const User = require('../Models/User');
const leerPublicaciones = async (req, res) => {
    try {
        // Usamos populate para obtener los datos del usuario referenciado en cada publicación
        const urls = await Publics.find().lean().populate('user'); // Cargar todas las publicaciones con los datos del usuario
        
        const currentUser = await User.findById(req.user.id).lean(); // Cargar el usuario actual
        // Obtener mensajes de flash
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        
        console.log('datos del usuario actual', currentUser);
        console.log('publicaciones con datos del usuario', urls);
        
        return res.render('home', { 
            urls,  // Enviamos las publicaciones con los datos del usuario poblados
            user: currentUser,
            telefono: currentUser.telefono,
            successMessage, 
            errorMessage 
        });
    } catch (error) {
        console.error('Error al leer publicaciones:', error);
        req.flash('error', 'Error al cargar las publicaciones');
        return res.redirect('/'); // Redirigir en caso de error
    }
};


const leertablas = async () => {
    try {
        const [rows] = await sqlPool.query("SELECT * FROM actividades");
        return rows;
    } catch (error) {
        throw { status: 500, message: "Error al obtener actividades" };
    }
};
const agregarPost = async (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                throw new Error("Error al procesar el formulario.");
            }

            const { Names } = fields;

            const fileKeys = Object.keys(files);
            if (!fileKeys.length) {
                throw new Error('Por favor agrega al menos una imagen.');
            }

            const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const processedImages = [];

            for (const key of fileKeys) {
                const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];

                for (const file of fileArray) {
                    if (!file.originalFilename) {
                        throw new Error('Uno de los archivos no tiene un nombre válido.');
                    }

                    if (!validMimeTypes.includes(file.mimetype.toLowerCase())) {
                        throw new Error(`El archivo ${file.originalFilename} no es un tipo de imagen válido (JPG, JPEG, PNG).`);
                    }

                    if (file.size > 5 * 1024 * 1024) { // 5MB
                        throw new Error(`El archivo ${file.originalFilename} es mayor a 5MB.`);
                    }

                    try {
                        const dirFile = path.join(__dirname, `/../public/Publicaciones/artesymas/${file.originalFilename}`);
                        const outputDir = path.dirname(dirFile);
                        await fs.promises.mkdir(outputDir, { recursive: true });

                        await sharp(file.filepath)
                            .resize(200, 200)
                            .jpeg({ quality: 80 })
                            .toFile(dirFile);

                        processedImages.push(file.originalFilename);
                    } catch (error) {
                        throw new Error(`Error al procesar la imagen ${file.originalFilename}: ${error.message}`);
                    }
                }
            }
            console.log(processedImages)
            const user=await User.findById(req.user.id);
            console.log(user.telefono)
            const publics = new Publics({
                name: Names || "pablitos",
                Imagen: processedImages,
                user: req.user.id,
                telefono: user.telefono
            });

            await publics.save();
            console.log('imagen a salvo')
            req.flash('success', 'Publicación creada con éxito.');
            return res.redirect('/principal');
        } catch (error) {
            console.log(error)
            //req.flash('error', error.message);
            return res.redirect("/principal");
        }
    });
};

const leerForos = async (req, res) => {
    try {
        const foros = await Foros.find().lean();

        // Obtener mensajes de éxito y error
        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');

        res.render("foros", { foros, successMessage, errorMessage });
    } catch (error) {
        console.error(error);
        req.flash('error', "Error al obtener los posts.");
        res.redirect("/foros"); // O redirigir a donde consideres apropiado
    }
};


const crearPost = async (req, res) => {
    const { pregunta, contexto } = req.body;
    const usuario = req.user.username;

    try {
        const nuevoPost = new Foros({ pregunta, contexto, usuario, fecha: new Date(), respuestas: [] });
        await nuevoPost.save();
        req.flash('success', 'Post creado con éxito.');
        res.redirect("/foros");
    } catch (error) {
        console.log(error);
        req.flash('error', "Error al crear el post.");
        res.redirect("/foros");
    }
};

const agregarRespuesta = async (req, res) => {
    const postId = req.params.id;
    const { texto } = req.body;
    const usuario = req.user.username;

    try {
        const foros = await Foros.findById(postId);
        foros.respuestas.push({ texto, usuario, fecha: new Date() });
        await foros.save();
        req.flash('success', 'Respuesta agregada con éxito.');
        res.redirect(`/foros/${postId}`); // Redirigir al post donde se agregó la respuesta
    } catch (error) {
        console.error(error);
        req.flash('error', "Error al agregar la respuesta.");
        res.redirect(`/foros/${postId}`); // Redirigir al post donde se intentó agregar la respuesta
    }
};
const leerpubs=(req, res)=>{
    res.send('yolo')
}
module.exports={
    agregarPost,
    agregarPost,
    agregarRespuesta,
    crearPost,
    leerForos,
    leerPublicaciones,
    leertablas,
    leerpubs,
}