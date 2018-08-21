import React, { Component } from 'react';
import firebase from 'firebase';
//import UserList from '../components/UserList';
//import UserForm from '../components/UserForm';
import Dashboard from '../components/Dashboard';
import FileUpload from '../components/FileUpload';
import '../assets/App.css';
import '../bootstrap.min.css';

import 'typeface-roboto'; // Fuente.

class App extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      pictures: [],
      users: [],
      posts: [],
      visible: "Público"
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleVisible = this.handleVisible.bind(this);
  }

  handleOnAddUser(event) {
    event.preventDefault();
    let user = {
      name: event.target.name.value,
      email: event.target.email.value
    };
    this.setState({
      users: this.state.users.concat([user])
    });
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
    //let user = {}
    //const dbRef = firebase.database().ref('users').dbRef.push().set(user);

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
              <div key="-2" className="App-card">
                <figure className="App=card-image">
                  <img width="320" src={picture.image} alt="" />
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

  handlePost() {
    if (document.getElementById("Ptopic").value !== "" && document.getElementById("Pmessage").value !== "") {
      let post = {
        uid: this.state.user.uid,
        uname: this.state.user.displayName,
        upic: this.state.user.photoURL,
        topic: document.getElementById("Ptopic").value,
        message: document.getElementById("Pmessage").value,
        likes: 0,
        comments: [],
        date: "Fecha",
        type: this.state.visible
      }
      firebase.database().ref('posts/').push().set(post);
      document.getElementById("Ptopic").value = ""
      document.getElementById("Pmessage").value = ""
      this.setState(() => ({
        visible: "Público"
      }))
    } else {
      alert("Llene cada campo. :v")
    }
  }

  handleVisible() {
    if (this.state.visible === "Público") {
      this.setState((e) => ({
        visible: "Privado"
      }))
    } else if (this.state.visible === "Privado") {
      this.setState((e) => ({
        visible: "Sólo seguidores"
      }))
    } else {
      this.setState((e) => ({
        visible: "Público"
      }))
    }
  }

  handleLike() {

  }

  componentDidMount() {
    firebase.database().ref('/posts/').on("value", (snapshot) => {
      const list = []
      snapshot.forEach(variable => {
        list.push(variable);
      })

      this.setState({
        posts: list
      })
    })
  }

  render() {
    const posts = this.state.posts.map(newVariable => {
      return (
        <div>
          <div>{newVariable.val().message}</div>
          <div>{newVariable.key}</div>`
          <button type="button" onClick={this.handleLike}>Like</button>
        </div>
      )
    })

    return (
      <div className="App">
        <Dashboard/>
        <header className="App-header">
          <h1 className="App-title">Mi Proyecto</h1>
        </header>
        <form>
          <input id="Ptopic" placeholder="Tema" />
          <input id="Pmessage" placeholder="Cuerpo de la publicación" />
          <button type="button" onClick={this.handleVisible}>{this.state.visible}</button>
          <button type="button" onClick={this.handlePost}>Postear</button>
        </form>
        {this.renderLogginButton()}

        <div id="board">{posts}</div>
      </div>
    );
  }
}

export default App;

/*
<p><strong>Añade usuarios</strong></p>
          <UserList users={this.state.users}  />
          <UserForm onAddUser={this.handleOnAddUser.bind(this)} />

 */