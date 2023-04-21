import { useReducer, useState } from 'react'
import './App.css'


function App() {

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [err, setErr] = useState(false);
  const [result, setResult] = useState('');

  class Polynomial {
    monomials = new Map();
    constructor() {}
    setMap(input) {
      const re = new RegExp("((?<sign>^|[+-])(((?<ac1>([0-9]*[.])?[0-9]+)\\*)?x(\\^(?<rank>[0-9]+))?|(?<ac2>([0-9]*[.])?[0-9]+)))+$");
      if(!input.match(re)) {
        setErr(true);
        return;
      }
      const re2 = new RegExp("((?<sign>^|[+-])(((?<ac1>([0-9]*[.])?[0-9]+)\\*)?x(\\^(?<rank>[0-9]+))?|(?<ac2>([0-9]*[.])?[0-9]+)))",'g');
      for (const match of input.matchAll(re2)) {
        const sign = match.groups.sign=="-" ? -1 : 1;
        let newRank = 0;
        let newCoeficient;
        if(!isNaN(match.groups.ac2)) {
          newCoeficient= 0;
          newCoeficient = sign * parseFloat(match.groups.ac2);
        } else {
          newCoeficient = sign * (isNaN(match.groups.ac1) ? 1 : parseFloat(match.groups.ac1));
          newRank = isNaN(match.groups.rank) ? 1 : parseInt(match.groups.rank);
        }
        if (newCoeficient != 0) {
          this.monomials.set(newRank, Array.from(this.monomials.keys()).some((element) => element==newRank) ? this.monomials.get(newRank) + newCoeficient : newCoeficient);
        }
      }
    }
    display() {
      if(this.monomials.size === 0) {
        return '0';
      }
      var rez = '';
      for(var [r, coef] of this.monomials) {
        const c = coef % 1 === 0 ? coef > 0 ? "+" + coef : "" + coef : coef > 0 ? "+" + coef : "" + coef;
        if(r === 0) {
          rez = rez + c;
        } else if(r===1) {
          if(c==='+1') {
            if(rez.length === 0) {
              rez = 'x' + rez;
            } else {
              rez = '+x' + rez;
            }
          } else if(c==='-1') {
              rez = '-x' + rez;
          } else {
              rez = c + '*x' + rez;
          }
        } else {
          if(c==='+1') {
            if(rez.length === 0) {
              rez = 'x^' + r + rez;
            } else {
              rez = '+x^' + r + rez;
            }
          } else if (c==='-1'){
            rez = '-x^' + r + rez;
          } else {
            rez = c + '*x^' + r + rez;
          }
        }
      }
      if(rez.charAt(0) === "+") {
        return rez.substring(1, rez.length);
      }
      return rez;
    }
  }
  
  function add(p1, p2) {
    let sum = new Polynomial();
    for (const key of p1.monomials.keys()) {
        sum.monomials.set(key, p1.monomials.get(key));
    }
    for (const key of p2.monomials.keys()) {
        if(Array.from(sum.monomials.keys()).some((element) => element==key)) {
            sum.monomials.set(key, sum.monomials.get(key)+p2.monomials.get(key));
        } else {
            sum.monomials.set(key, p2.monomials.get(key));
        }
        if(sum.monomials.get(key) == 0) {
            sum.monomials.delete(key);
        }
    }
    return sum;
    
  }
  

  function Result() {
    if(err) return <>
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading text-left">Error.</h4>
      <p>Something went wrong.</p>
      <hr/>
      <p class="mb-0">Try again! Please follow the example.</p>
    </div>
    </>
    if(result!=='') return <>
    <div class="alert alert-success" role="alert">
      <h4 class="alert-heading text-left">Result</h4>
      <p>{result}</p>
      <hr/>
      <p class="mb-0">Do another calculation!</p>
    </div>
    </>
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr(false);
    const poli1 = new Polynomial();
    poli1.setMap(p1);
    const poli2 = new Polynomial();
    poli2.setMap(p2);
    const res = add(poli1, poli2);
    setResult(res.display());
  }
  return (
    <>
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" fill="currentColor" class="bi bi-calculator" viewBox="0 0 16 16">
      <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
      <path d="M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z"/>
    </svg>
  <form class="mt-3" onSubmit={handleSubmit}>
    <div class="mb-3">
      <label class="form-label">First polynomial</label>
      <input type="text" onChange={(e) => setP1(e.target.value)} class="form-control"/>
    </div>

    <div class="mb-3">
      <label class="form-label">Second polinomial</label>
      <input type="text" onChange={(e) => setP2(e.target.value)} class="form-control" aria-describedby="polinomialExample"/>
      <div id="polinomialExample" class="form-text">Input example: x^2+3*x-6</div>
    </div>
    <Result/>
    <div class="btn-group" role="group" aria-label="Basic outlined example">
      <button type='submit' class="btn btn-outline-dark">Add</button>
      <button type='submit' class="btn btn-outline-dark">Subtract</button>
      <button type='submit' class="btn btn-outline-dark">Multiply</button>
      <button type='submit' class="btn btn-outline-dark">Divide</button>
      <button type='submit' class="btn btn-outline-dark">Integrate</button>
      <button type='submit' class="btn btn-outline-dark">Drivate</button>
    </div>
  </form>
  </>);
}

export default App
