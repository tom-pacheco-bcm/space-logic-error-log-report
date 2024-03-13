import { CreateDataStore } from "./dataStore";
import { TablePage } from "./pages/tablePage";

export default function App() {
  window.addEventListener('load', () => {
    if (typeof client === 'undefined') {
      console.error('client is not defined')
      return
    }

    const dataStore = CreateDataStore()
    TablePage(dataStore)
  });
}


