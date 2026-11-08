import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {XMarkdown} from '../src/react.js';
import {showcaseCases} from '../examples/showcase.js';
import '../src/styles.css';
function Demo(){
  const [source,setSource]=useState(showcaseCases.find(c=>c.id==='15-planner').x);
  const [selected,setSelected]=useState('15-planner');
  return React.createElement(React.Fragment,null,
    React.createElement('label',{htmlFor:'react-example'},'React component example'),
    React.createElement('select',{id:'react-example',value:selected,onChange:event=>{setSelected(event.target.value);setSource(showcaseCases.find(c=>c.id===event.target.value).x);}},
      showcaseCases.map(c=>React.createElement('option',{key:c.id,value:c.id},c.title))),
    React.createElement(XMarkdown,{source,className:'xmarkdown react-native',onError:error=>console.error(error.message)}));
}
createRoot(document.getElementById('react-root')).render(React.createElement(Demo));
