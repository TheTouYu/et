import Element from './Element.js';
import './App.css'
import { vShow } from 'vue';
import KeyboardEventHandler  from './UiControl.js';
import SaveData from './Data.js'

const TopSide = () => {
  const D = new SaveData();
  return (
    <div id="TopSide" className="TopSide">
      {D.saveButton('保存')}
    </div>
  );
}
const Main = () => {
  return (
    <div id="Main" className="Main">
    </div>
  );
};

const LeftSide = () => {
  // add event, see Uicontrol.js
    const KEH = new KeyboardEventHandler('#root');

    const types = ['switch','textInput','numberInput','text', 'number', 'switch', 'checkbox','button'];
    const render = [];
    types.map((type, index) => {
        render.push(<Element type={type} key={index} />)
    });
    return (
      <div id="LeftSide" className="LeftSide" style={{
        borderRight:'3px dashed #ccc', minHeight: '100vh',
      }}>
        {render}
        <label>
          {/* <input id="test" type="checkbox" /> */}
          状态
        </label>
      </div>
    );
}
export default function App() {
  return (
    <div id='App' style={{
        display:'flex', flexFlow:'row wrap'
    }}>
      <TopSide />
      <LeftSide />
      <Main />
    </div>
  );
} 

