import React, { Component } from 'react';
import firebase from 'firebase';

import FileUpload from './FileUpload';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      pictures: []
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => { // Cada vez que nos loggeemos o nos salgamos, el user tendrá información.
      this.setState({ user });
    });

    firebase.database().ref('pictures').on('child_added', snapshot => {
      this.setState({
        pictures: this.state.pictures.concat(snapshot.val())
      });
    });
  }

  handleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
      .then(result => console.log(`${result.user.email} ha iniciado sesión`))
      .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleLogOut() {
    firebase.auth().signOut()
      .then(result => console.log(`${result.user.email} ha cerrado sesión`))
      .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleUpload(event) {
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref(`/Fotos/${file.name}`);
    const task = storageRef.put(file);

    task.on('state_changed', snapshot => { // Obtiene el estado de la carga del fichero.
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      this.setState({
        uploadValue: percentage
      })
    }, error => {
      console.log(error.message);
    }, () => storageRef.getDownloadURL().then(url => {
      const record = {
        photoURL: this.state.user.photoURL,
        displayName: this.state.user.displayName,
        image: url
      };

      const dbRef = firebase.database().ref('pictures');
      const newPicture = dbRef.push();
      newPicture.set(record);
    }));
  }

  renderLogginButton() {
    if (this.state.user) { // Si el usuario está loggeado.
      return (
        <div>
          <img width="100" src={this.state.user.photoURL} alt={this.state.user.displayName} />
          <p>¡Hola, {this.state.user.displayName}!</p>
          <button onClick={this.handleLogOut}>Log out</button>

          <FileUpload onUpload={this.handleUpload} uploadValue={this.state.uploadValue} />

          {
            this.state.pictures.map(picture => (
              <div className="App-card">
                <figure className="App=card-image">
                  <img width="320"src={picture.image} alt="" />
                  <figcaption className="App-card-footer">
                    <img className="App-card-avatar" src={picture.photoURL} alt={picture.displayName} />
                    <span className="App-card-name">{picture.displayName}</span>
                  </figcaption>
                </figure>
              </div>
            )).reverse()
          }

        </div>
      );
    } else { // Si no lo está.
      return (
        <button onClick={this.handleAuth}>Login</button>
      );
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Mi Proyecto</h1>
        </header>
        <p className="App-intro">
          {this.renderLogginButton()}
        </p>
      </div>
    );
  }
}

export default App;