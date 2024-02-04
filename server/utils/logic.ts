import axios from 'axios';

export async function loadImage(url: string) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    return buffer;
  } catch (error) {
    throw new Error('Error loading image: ' + error.message);
  }
}
