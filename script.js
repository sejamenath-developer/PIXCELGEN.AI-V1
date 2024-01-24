const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "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"; // Your OpenAI API key here
let isImageGenerating = true;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");

    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;

    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/dataautogpt3/OpenDalle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to generate AI images. ${errorData.error}`);
    }

    const { data } = await response.json();
    updateImageCard([...data]);
  } catch (error) {
    console.error(error);
    alert("An error occurred while generating AI images. Check the console for details.");
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);

  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
    `<div class="img-card loading">
      <img src="loader.svg" alt="AI generated image">
      <a class="download-btn" href="#">
        <img src="download.svg" alt="download icon">
      </a>
    </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleImageGeneration);
