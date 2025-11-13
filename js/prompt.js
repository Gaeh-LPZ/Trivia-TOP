export const prompt = `Genera una pregunta aleatoria y única acerca de la banda Twenty One Pilots. La pregunta debe cubrir diferentes aspectos como: historia de la banda, miembros, álbumes, canciones, giras, curiosidades, letras de canciones, premios, o datos interesantes. 

Asegúrate de que:
- La pregunta sea original y no se repita
- Tenga 4 opciones de respuesta con formato "a) Opción", "b) Opción", etc.
- Solo una respuesta sea correcta
- Incluya una explicación detallada

Devuelve ÚNICAMENTE el JSON con este formato:
{
    "pregunta": "Texto de la pregunta",
    "opciones": ["a) Op1", "b) Op2", "c) Op3", "d) Op4"],
    "respuesta_correcta": "a) Op1",
    "explicacion": "Explicación detallada"
}`;