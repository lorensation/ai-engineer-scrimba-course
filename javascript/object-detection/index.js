
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.8.0'

// Configure transformers.js to use remote models
env.allowRemoteModels = true
env.allowLocalModels = false

// Reference the elements that we will need
const status = document.getElementById('status')
const image = document.getElementById('image')

// Load model and create a new object detection pipeline
status.textContent = 'Loading model...'

let detector

async function initializeModel() {
    try {
        detector = await pipeline('object-detection', 'Xenova/detr-resnet-50')
        status.textContent = 'Ready! Click on the image to detect objects.'
    } catch (error) {
        console.error('Failed to load model:', error)
        status.textContent = 'Error loading model. Please refresh and try again.'
    }
}

// Initialize the model
initializeModel()

// Add click event listener to detect objects
image.addEventListener('click', async () => {
    if (!detector) {
        status.textContent = 'Model not loaded yet. Please wait...'
        return
    }
    
    status.textContent = 'Detecting objects...'
    
    try {
        // Try using the image URL first, if that fails, try canvas conversion
        let output
        try {
            output = await detector(image.src)
        } catch (urlError) {
            console.log('URL approach failed, trying canvas conversion...')
            
            // Alternative: Convert image to data URL
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight
            ctx.drawImage(image, 0, 0)
            
            // Convert to blob and use that
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            output = await detector(imageData)
        }
        
        // Get the actual displayed image dimensions for scaling
        const scaleX = image.offsetWidth / image.naturalWidth
        const scaleY = image.offsetHeight / image.naturalHeight
        
        // Clear previous bounding boxes
        const container = document.getElementById('image-container')
        const existingBoxes = container.querySelectorAll('.bounding-box')
        existingBoxes.forEach(box => box.remove())
        
        // Clear previous objects list
        const objectsList = document.getElementById('objects-list')
        objectsList.innerHTML = ''
        
        // Filter detections with confidence > 20%
        const validDetections = output.filter(d => d.score > 0.2)
        
        // Create bounding boxes for detected objects
        validDetections.forEach((detection, i) => {
            const { box, label, score } = detection
            
            // Create bounding box element
            const boundingBox = document.createElement('div')
            boundingBox.className = 'bounding-box'
            const color = `hsl(${i * 137.5 % 360}, 100%, 50%)`
            boundingBox.style.borderColor = color
            
            // Scale the coordinates to match displayed image size
            boundingBox.style.left = `${box.xmin * scaleX}px`
            boundingBox.style.top = `${box.ymin * scaleY}px`
            boundingBox.style.width = `${(box.xmax - box.xmin) * scaleX}px`
            boundingBox.style.height = `${(box.ymax - box.ymin) * scaleY}px`
            
            // Create label element
            const labelElement = document.createElement('div')
            labelElement.className = 'bounding-box-label'
            labelElement.style.backgroundColor = color
            labelElement.textContent = `${label} (${(score * 100).toFixed(1)}%)`
            
            boundingBox.appendChild(labelElement)
            container.appendChild(boundingBox)
            
            // Add to objects list
            const listItem = document.createElement('li')
            listItem.style.borderLeftColor = color
            listItem.innerHTML = `
                <span class="object-label">${label}</span>
                <span class="confidence-score">${(score * 100).toFixed(1)}%</span>
            `
            objectsList.appendChild(listItem)
        })
        
        // Show/hide detection results
        const detectionResults = document.getElementById('detection-results')
        if (validDetections.length > 0) {
            detectionResults.style.display = 'block'
        } else {
            detectionResults.style.display = 'none'
        }
        
        status.textContent = `Found ${validDetections.length} objects. Click again to re-detect.`
    } catch (error) {
        console.error('Detection failed:', error)
        status.textContent = 'Detection failed. Please try again.'
    }
})