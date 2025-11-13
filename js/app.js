import { prompt } from "./prompt.js";

const API_KEY = "AIzaSyC4jhyV7OrQldg3X08Q5c8X_YuETDwmjzY";
const MODEL = "gemini-2.0-flash";

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

function inicializarContadores() {
    if (!localStorage.getItem('correctCount')) {
        localStorage.setItem('correctCount', '0');
    }
    if (!localStorage.getItem('incorrectCount')) {
        localStorage.setItem('incorrectCount', '0');
    }
}

function desplegarContadores() {
    const correctCount = localStorage.getItem('correctCount') || '0';
    const incorrectCount = localStorage.getItem('incorrectCount') || '0';
    
    document.getElementById('correct-answers-counter').textContent = correctCount;
    document.getElementById('incorrect-answers-counter').textContent = incorrectCount;
}

function incrementarContador(correcto) {
    const clave = correcto ? 'correctCount' : 'incorrectCount';
    const valorActual = parseInt(localStorage.getItem(clave)) || 0;
    const nuevoValor = valorActual + 1;
    localStorage.setItem(clave, nuevoValor.toString());
    document.getElementById('next-question').textContent = 'Siguiente Pregunta';
    
    if (!correcto) {
        document.getElementById('next-question').textContent = 'Siguiente Pregunta';
        const incorrectCount = parseInt(localStorage.getItem('incorrectCount')) || 0;
        if (incorrectCount >= 3) {
            localStorage.setItem('correctCount', '0');
            localStorage.setItem('incorrectCount', '0');
            setTimeout(() => {
                document.getElementById('explicacion').innerHTML += 
                    '<br><br><strong>¡Has alcanzado 3 respuestas incorrectas! Los contadores se han reiniciado.</strong>';
            }, 500);
            document.getElementById('next-question').textContent = 'Reinciar';
        }
    }
    
    desplegarContadores();
}

async function generarPregunta() {
    try {
        const response = await fetch(
            url,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    // Opcional: añadir la configuración de generación
                    generationConfig: {
                        temperature: 0.25,
                        responseMimeType: "application/json"
                    },
                }),
            }
        );

        // Manejo de errores de HTTP
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Respuesta transformada a json:", data);

        
        // Extracción simple del texto de la respuesta, asumiendo que la respuesta tiene al menos una 'candidate' y 'part'     
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        const textResultTrimmed = textResult.trim();
        const firstBraceIndex = textResultTrimmed.indexOf('{');
        const lastBraceIndex = textResultTrimmed.lastIndexOf('}');
        const jsonString = textResultTrimmed.substring(firstBraceIndex, lastBraceIndex + 1);


        if (jsonString) {            
            const questionData = JSON.parse(jsonString);
            console.log(questionData);
            return questionData;
        } else {
            console.log("No se pudo extraer el texto de la respuesta.");
        }

    } catch (error) {
        console.error("Hubo un error en la petición:", error);
        document.getElementById('pregunta').textContent = 'Error al cargar la pregunta. Por favor, revisa la clave API o la consola.';
        return null;
    }
}

async function cargarPregunta() {
    // Mostrar mensaje de carga
    document.getElementById('pregunta').className = 'text-warning';
    document.getElementById('pregunta').textContent = 'Cargando pregunta ...';
    document.getElementById('opciones').innerHTML = '';
    document.getElementById('explicacion').textContent = '';

    const datosPregunta = await generarPregunta();
    console.log(datosPregunta);

    if (datosPregunta) {
        document.getElementById('pregunta').className = 'text-success';
        console.log("Datos de la pregunta recibidos:", datosPregunta);
        desplegarPregunta(datosPregunta);
    }
}

function desplegarPregunta(datosPregunta) {
    document.getElementById('pregunta').innerHTML = datosPregunta.pregunta;
    let pregutaRespondida = false;

    const options = document.getElementById('opciones');
    const lista = document.createElement('ul');
    
    datosPregunta.opciones.forEach(opcion => {
        const li = document.createElement('li');
        li.textContent = opcion;
        lista.appendChild(li);
    });

    lista.addEventListener('click', (e) => {
        if(e.target.tagName == 'LI' && !pregutaRespondida) {
            pregutaRespondida = true;
            const esCorrecta = (e.target.textContent === datosPregunta.respuesta_correcta);
            console.log(esCorrecta);

            if (esCorrecta) {
                e.target.classList.add('correct');
                incrementarContador(esCorrecta);
            } else {
                e.target.classList.add('incorrect');
                incrementarContador(esCorrecta);
            }

            document.querySelector('#explicacion').innerHTML = datosPregunta.explicacion;

            const liTotales = document.querySelectorAll('li');
            liTotales.forEach(li => {
                if (li !== e.target) {
                    li.classList.add('disabled');
                }
            })

            document.getElementById('next-question').style.display = 'block';
        }
    })
    options.appendChild(lista);
    document.getElementById('next-question').style.display = 'none';
}

window.onload = () => {
    console.log("Página cargada y función inicial ejecutada.");
    inicializarContadores();
    desplegarContadores();
    cargarPregunta();
    document.getElementById('next-question').addEventListener('click', () => {
        document.getElementById('next-question').style.display = 'none';
        cargarPregunta();
    });
};  
