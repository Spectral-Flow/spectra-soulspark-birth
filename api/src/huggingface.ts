import axios from 'axios';

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_API_KEY = process.env.HF_API_KEY;

export async function textToSpeech(text: string, model: string = 'espnet/kan-bayashi_ljspeech_vits') {
  const response = await axios.post(
      `${HF_API_URL}/${model}`,
          { inputs: text },
              { headers: { Authorization: `Bearer ${HF_API_KEY}` }, responseType: 'arraybuffer' }
                );
                  return response.data; // Audio buffer
                  }

                  export async function speechToText(audioBuffer: Buffer, model: string = 'openai/whisper-large-v2') {
                    const response = await axios.post(
                        `${HF_API_URL}/${model}`,
                            audioBuffer,
                                {
                                      headers: {
                                              Authorization: `Bearer ${HF_API_KEY}`,
                                                      'Content-Type': 'audio/wav',
                                                            },
                                                                }
                                                                  );
                                                                    return response.data; // Transcription result
                                                                    }

                                                                    export async function runSpectraModel(prompt: string, model: string = 'mistralai/Mistral-7B-Instruct-v0.2') {
                                                                      const response = await axios.post(
                                                                          `${HF_API_URL}/${model}`,
                                                                              { inputs: prompt },
                                                                                  { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
                                                                                    );
                                                                                      return response.data; // Model output
                                                                                      }