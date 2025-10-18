import { InferenceClient } from "@huggingface/inference";
import { HfInference } from '@huggingface/inference'
import 'dotenv/config';

// Debug: Check if token is loaded
console.log('Token loaded:', !!process.env.HF_TOKEN);

const hf = new InferenceClient(process.env.HF_TOKEN);

const output = await hf.textClassification({
	model: "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
	inputs: "I like you! I love you!",
	provider: "hf-inference",
});

console.log(output[0].label);

const client = new HfInference(process.env.HF_TOKEN)

const text = "It's an exciting time to be an A.I. engineer."

const response = await client.textToSpeech({
  inputs: text,
  model: "espnet/kan-bayashi_ljspeech_vits"
})

console.log(response)

const audioElement = document.getElementById('speech')
const speechUrl = URL.createObjectURL(response)
audioElement.src = speechUrl 