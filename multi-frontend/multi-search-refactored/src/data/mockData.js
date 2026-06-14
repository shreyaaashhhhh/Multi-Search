import headphones from "../assets/images/headphones.jpg";
import smartwatch from "../assets/images/smartwatch.jpg";
import speaker from "../assets/images/speaker.jpg";
import javascriptBook from "../assets/images/javascript-book.jpg";
import reactBook from "../assets/images/react-book.jpg";
import uiuxBook from "../assets/images/uiux.jpg";
import tshirt from "../assets/images/tshirt.jpg";
import jeans from "../assets/images/jeans.jpg";
import hoodie from "../assets/images/hoodie.jpg";
import keyboard from "../assets/images/keyboard.jpg";
import mouse from "../assets/images/mouse.jpg";
import backpack from "../assets/images/backpack.jpg";
import dataBook from "../assets/images/data-book.jpg";
import tripod from "../assets/images/tripod.jpg";
import jacket from "../assets/images/jacket.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const imageByKey = {
  headphones,
  smartwatch,
  speaker,
  javascriptBook,
  reactBook,
  uiuxBook,
  tshirt,
  jeans,
  hoodie,
  keyboard,
  mouse,
  backpack,
  dataBook,
  tripod,
  jacket,
};

/** @type {Array<{ id: number, name: string, category: string, price: number, image: string }>} */
export const items = [
  { id: 1, name: "Wireless Noise-Canceling Headphones", category: "electronics", price: 1939, imageKey: "headphones" },
  { id: 2, name: "Smart Fitness Watch", category: "electronics", price: 1493, imageKey: "smartwatch" },
  { id: 3, name: "Bluetooth Portable Speaker", category: "electronics", price: 1189, imageKey: "speaker" },
  { id: 4, name: "Modern JavaScript Guide", category: "books", price: 139, imageKey: "javascriptBook" },
  { id: 5, name: "React Development Handbook", category: "books", price: 145, imageKey: "reactBook" },
  { id: 6, name: "UI/UX Design Fundamentals", category: "books", price: 129, imageKey: "uiuxBook" },
  { id: 7, name: "Casual Cotton T-Shirt", category: "clothing", price: 235, imageKey: "tshirt" },
  { id: 8, name: "Slim Fit Denim Jeans", category: "clothing", price: 608, imageKey: "jeans" },
  { id: 9, name: "Winter Hoodie", category: "clothing", price: 955, imageKey: "hoodie" },
  { id: 10, name: "Gaming Mechanical Keyboard", category: "electronics", price: 1920, imageKey: "keyboard" },
  { id: 11, name: "Wireless Ergonomic Mouse", category: "electronics", price: 499, imageKey: "mouse" },
  { id: 12, name: "Laptop Backpack", category: "clothing", price: 700, imageKey: "backpack" },
  { id: 13, name: "Data Structures Explained", category: "books", price: 142, imageKey: "dataBook" },
  { id: 14, name: "Smartphone Tripod Stand", category: "electronics", price: 1315, imageKey: "tripod" },
  { id: 15, name: "Premium Leather Jacket", category: "clothing", price: 1780, imageKey: "jacket" },
];

function withImage(item) {
  return {
    ...item,
    image: item.image ?? imageByKey[item.imageKey] ?? "",
  };
}

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
}

/** Fetches all products from FastAPI, falling back to local data while developing. */
export async function fetchItems() {
  try {
    const data = await getJson("/products");
    return data.map(withImage);
  } catch (error) {
    console.warn("Using local product data because API fetch failed.", error);
    return items.map(withImage);
  }
}

/** Fetches one product from FastAPI by ID, falling back to local data while developing. */
export async function fetchItemById(id) {
  try {
    const data = await getJson(`/products/${id}`);
    return withImage(data);
  } catch (error) {
    console.warn("Using local product detail because API fetch failed.", error);
    const item = items.find((product) => product.id === Number(id));
    return item ? withImage(item) : null;
  }
}
