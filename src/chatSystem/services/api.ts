import { BaseUrl } from "../../config/Key";

const API_BASE = BaseUrl.base_url;
// const API_BASE = 'https://ayurmuni.aimantra.info';
const WS_BASE = API_BASE.replace('https', 'ws');

export { API_BASE, WS_BASE };