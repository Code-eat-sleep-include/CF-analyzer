import axios from 'axios';
import React, { ReactNode } from 'react';
import './App.css';
import ErrorComponent from './components/Error/Error';
import Loading from './components/Loading/Loading';
import UserInfo from './components/Chart/UserInfo';
import config from '../config';
const NodeRSA = require('node-rsa');

class App extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      userName: '',
      tempUserName: '',
      correctQuestions: [],
      errorCode: 0,
      showCharts: false,
      private: false,
      password: ''
    }
  }

  cleanData = (data: any): void => {
    let cleanedArray: unknown[] = []
    let cleanedData = new Set();
    let n = data.length;

    for (let i = 0; i < n; i++) {
      if (data[i].verdict === 'OK') {
        if (!cleanedData.has(data[i].problem.contestId + data[i].problem.index)) {
          cleanedArray.push(data[i].problem)
          cleanedData.add(data[i].problem.contestId + data[i].problem.index)
        }
      }
    }

    this.setState({ ...this.state, correctQuestions: cleanedArray, showCharts: true });
  }

  submitUsername = (): void => {
    this.setState({ ...this.state, isLoading: true, errorCode: 0, showCharts: false, userName: this.state.tempUserName });
    let url = `https://codeforces.com/api/user.status?handle=${this.state.tempUserName}&from=1&count=10000`
    axios.get(url)
      .then((result) => {
        this.cleanData(result.data.result);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ errorCode: error.response.status });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      })
  }

  submitUsernamePassword = (): void => {
    this.setState({ ...this.state, isLoading: true, errorCode: 0, showCharts: false, userName: this.state.tempUserName });

    const port = config.SERVER_PORT;
    const host = config.SERVER_HOST;
    
    axios.get(`http://${host}:${port}/getPublicKey`)
      .then(async (results) => {
        const pKey = results.data;
        const key = new NodeRSA();
        await key.importKey(pKey, 'public');
        const enc = await key.encrypt(this.state.password, 'base64');
        await axios.post(`http://${host}:${port}/scrape`, {user: this.state.tempUserName, password: enc})
          .then((results) => {
            if(results.data === "Error"){
              this.setState({...this.state, errorCode: 1});
            } else {
              this.setState({ ...this.state, correctQuestions: results.data, showCharts: true });
            }
          })
          .catch((err) => {
            console.log(err);
          })
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        this.setState({ isLoading: false });
      })

  }

  togglePrivateState = (): void => {
    this.setState({ ...this.setState, private: !this.state.private })
  }

  _handleKeyboardEvent = (event: any): void => {
    if (event.key === 'Enter') {
      this.submitUsername();
    }
  }

  _handleKeyboardEventPassword = (event: any): void => {
    if (event.key === 'Enter') {
      this.submitUsernamePassword();
    }
  }

  handleInput = (event: any): void => {
    this.setState({ tempUserName: event.target.value });
  }
  
  handlePassword = (event: any): void => {
    this.setState({...this.state, password: event.target.value})
  }

  render(): ReactNode {
    return (
      <div className='container'>
        <div>
          <h1 className='banner'>Learn Intelligently</h1>
          <p className='description'>Use this tool to get a detailed analysis of your progress on Codeforces and use this knowledge to learn effectively by working on the topics that need the most attention.</p>

          {
            !this.state.private &&
            <div>
              <input type='text' required className='inputBox' placeholder='User handle' onChange={this.handleInput} onKeyDown={this._handleKeyboardEvent}></input>
              <button className='goButton' onClick={this.submitUsername}>Go!</button>
            </div>
          }

          {
            this.state.private &&
            <div>
              <div>
                <input type='text' required className='inputBox' placeholder='User handle' onChange={this.handleInput} onKeyDown={this._handleKeyboardEvent}></input>
                <input type='password' required className='inputBox' placeholder='Password' onChange={this.handlePassword} onKeyDown={this._handleKeyboardEventPassword}></input>
                <button className='goButton' onClick={this.submitUsernamePassword}>Go!</button>
              </div>
              <div className='disclaimer'>
                Your passwords are end-to-end encrypted using RSA algorithm.
              </div>
            </div>
          }

          <button className={'private'} onClick={this.togglePrivateState}>See {!this.state.private ? 'private' : 'public '} submissions</button>


          <div className='attribution'>
            <a target='_blank' rel='noreferrer' href='https://github.com/Code-eat-sleep-include'>&copy; Niharika Shah</a>
          </div>
        </div>

        {(this.state.errorCode !== 0 && this.state.errorCode !== 1) && <ErrorComponent code={this.state.errorCode}></ErrorComponent>}

        {this.state.errorCode === 1 && <ErrorComponent code={"We ran into some issues, please check your credentials or try again later."}></ErrorComponent>}

        {this.state.isLoading && <Loading></Loading>}

        {
          this.state.showCharts &&
          <UserInfo
            array={this.state.correctQuestions}
            userName={this.state.userName}>
          </UserInfo>
        }

      </div>
    )
  }



}

export default App;
