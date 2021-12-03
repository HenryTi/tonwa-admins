import { nav, NavView, start } from 'tonva';
import './App.css';
import { CApp } from 'UqApp/CApp';

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/

function App() {
  let onLogined = async () => {
    nav.clear();
    await start(CApp, undefined);
    //let cAdmin = new CHome({});
    //await cAdmin.start();
  }
  return (<NavView onLogined={onLogined} />);
}

export default App;
