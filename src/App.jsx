import { useReducer, useState } from 'react'
import './App.css'


function App() {

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [err, setErr] = useState('');
  const [result, setResult] = useState('');

  class Polynomial {
    monomials = new Map();
    constructor() {}
    setMap(input) {
      const re = new RegExp("((?<sign>^|[+-])(((?<ac1>([0-9]*[.])?[0-9]+)\\*)?x(\\^(?<rank>[0-9]+))?|(?<ac2>([0-9]*[.])?[0-9]+)))+$");
      if(!input.match(re)) {
        setErr("Try again! Please follow the example.");
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
        const c = coef % 1 === 0 ? coef > 0 ? "+" + coef : "" + coef : coef > 0 ? "+" + coef.toFixed(2) : "" + coef.toFixed(2);
        if(r === 0) {
          rez = rez + c;
        } else if(r===1) {
          if(c==='+1') {
            if(rez.length === 0) {
              rez = rez + 'x';
            } else {
              rez = rez + '+x';
            }
          } else if(c==='-1') {
              rez = rez + '-x';
          } else {
              rez = rez + c + '*x';
          }
        } else {
          if(c==='+1') {
            if(rez.length === 0) {
              rez = rez + 'x^' + r;
            } else {
              rez = rez + '+x^' + r;
            }
          } else if (c==='-1'){
            rez = rez + '-x^' + r;
          } else {
            rez = rez + c + '*x^' + r;
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

  function difference(p1, p2) {
    let diff = new Polynomial();
    for (const key of p1.monomials.keys()) {
      diff.monomials.set(key, p1.monomials.get(key));
    }
    for (const key of p2.monomials.keys()) {
        if(Array.from(diff.monomials.keys()).some((element) => element==key)) {
          diff.monomials.set(key, diff.monomials.get(key)-p2.monomials.get(key));
        } else {
          diff.monomials.set(key, -p2.monomials.get(key));
        }
        if(diff.monomials.get(key) == 0) {
          diff.monomials.delete(key);
        }
    }
    return diff;
  }

  function multiply(p1,p2) {
    const result = new Polynomial();
        for (const key1 of p1.monomials.keys()) {
            for (const key2 of p2.monomials.keys()) {
                if(result.monomials.get(key1+key2)!==undefined) {
                    result.monomials.set(key2 + key1, result.monomials.get(key1 + key2) + p1.monomials.get(key1) * p2.monomials.get(key2));
                } else {
                    result.monomials.set(key2 + key1, p1.monomials.get(key1) * p2.monomials.get(key2));
                }
            }
        }
        return result;
  }

  function devide(p1, p2) {
    var p1Deg = Math.max(...p1.monomials.keys());
    var p2Deg = Math.max(...p2.monomials.keys());
    if((p2Deg===0 && p2.get(p2Deg) === 0) || p2.monomials.size === 0) {
      setErr("Please don't divide by zero.");
      return [null, null];
    }
    var res = new Polynomial();
    while(p1.monomials.size > 0 && p1Deg >= p2Deg){
        const toSub = new Polynomial();
        const k = p1Deg - p2Deg;
        const c = p1.monomials.get(p1Deg) / p2.monomials.get(p2Deg) ;
        toSub.monomials.set(k,c);
        res.monomials.set(k,c);
        const p3 = multiply(p2, toSub);
        p1 = difference(p1, p3);
        p1Deg = Math.max(...p1.monomials.keys());
        p2Deg = Math.max(...p2.monomials.keys());
    }
    return [res, p1];
  }

  function derivate(p1) {
    const res = new Polynomial();
        for (const key of p1.monomials.keys()) {
            if(key>0) {
                res.monomials.set(key - 1, p1.monomials.get(key)*key);
            }
        }
        return res;
  }

  function integrate(p) {
    if(p.monomials.size === 0) {
      return new Polynomial();
    }
    const res = new Polynomial();
    for (const key of p.monomials.keys()) {
      res.monomials.set(key+1, p.monomials.get(key)/(key+1));
    }
    return res;
  }

  function Result() {
    if(err!='') return <>
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading text-left">Error.</h4>
      <p>Something went wrong.</p>
      <hr/>
      <p class="mb-0">{err}</p>
    </div>
    </>
    if(Array.isArray(result)) return <>
    <div class="alert alert-success" role="alert">
      <h4 class="alert-heading text-left">Result</h4>
      <p>{result[0]}</p>
      <p>{result[1]}</p>
      <hr/>
      <p class="mb-0">Do another calculation!</p>
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

  const handleClick = (e, op) => {
    e.preventDefault();
    setErr('');
    const poli1 = new Polynomial();
    poli1.setMap(p1);
    const poli2 = new Polynomial();
    poli2.setMap(p2);
    switch(op) {
      case 0:
        setResult(add(poli1, poli2).display());
        break;
      case 1:
        setResult(difference(poli1, poli2).display());
        break;
      case 2:
        setResult(multiply(poli1, poli2).display());
        break;
      case 3:
        const [quotient, remainder] = devide(poli1, poli2);
        if(quotient!=null && remainder!=null) setResult([quotient.display(), "R: " + remainder.display()]);
        break;
      case 4:
        const [d1, d2] = [derivate(poli1), derivate(poli2)];
        setResult([d1.display(), d2.display()]);
        break;
      case 5:
        const [i1, i2] = [integrate(poli1), integrate(poli2)];
        setResult([i1.display() + "+c", i2.display() + "+c"]);
        break;
      default:
        // code block
    } 
  }
  return (
    <>
    <div className='svg-container'>
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-calculator" viewBox="0 0 16 16">
      <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
      <path d="M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z"/>
    </svg>
    </div>
  <form>
  <div class="form-group">
    <div class="mb-3">
      <label class="form-label">First polynomial</label>
      <input type="text" onChange={(e) => setP1(e.target.value)} class="form-control"/>
    </div>

    <div class="mb-3">
      <label class="form-label">Second polinomial</label>
      <input type="text" onChange={(e) => setP2(e.target.value)} class="form-control" aria-describedby="polinomialExample"/>
      <div id="polinomialExample" class="form-text">Input example: x^2+3*x-6</div>
    </div>
  </div>
  <Result/>
  <div class="container-fluid">
    <div class="row gx-1">
      <button class="col-6 col-md-4 btn btn-outline-dark btn-block rounded-0" onClick={(e) => handleClick(e, 0)}>Add</button>
      <button class="col-6 col-md-4 btn btn-outline-dark btn-block rounded-0" onClick={(e) => handleClick(e, 1)}>Subtract</button>
      <button class="col-6 col-md-4 btn btn-outline-dark btn-block rounded-0" onClick={(e) => handleClick(e, 2)}>Multiply</button>
      <button class="col-6 col-md-4 btn btn-outline-dark btn-block rounded-0" onClick={(e) => handleClick(e, 3)}>Divide</button>
      <button class="col-6 col-md-4 btn btn-outline-dark btn-block rounded-0" onClick={(e) => handleClick(e, 4)}>Drivate</button>
      <button class="col-6 col-md-4 btn btn-outline-dark btn-block rounded-0" onClick={(e) => handleClick(e, 5)}>Integrate</button></div>
  </div>
  </form>
  </>);
}

export default App
