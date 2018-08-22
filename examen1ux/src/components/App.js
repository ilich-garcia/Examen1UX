import React, { Component } from 'react';
import firebase from 'firebase';
//import UserList from '../components/UserList';
//import UserForm from '../components/UserForm';
import FileUpload from '../components/FileUpload';
import '../assets/App.css';
import '../bootstrap.min.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      pictures: [],
      users: [],
      posts: [],
      visible: "Público",
      filter: "Todos",
      temp_CurrentPost: null,
      commentModal: " "
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleVisible = this.handleVisible.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleComment = this.handleComment.bind(this)
    this.handleCommentModal = this.handleCommentModal.bind(this)
    this.handleLike = this.handleLike.bind(this)
    this.handleAlert = this.handleAlert.bind(this)
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
      if (user !== null) {
        this.setState({ user });
        firebase.database().ref('users/' + user.uid).set({ displayName: user.displayName, photoURL: user.photoURL, followers: [] });
      }
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
      .then(result => {
        console.log(`${result.user.email} ha iniciado sesión`)
        this.setState(() => ({
          alert: <div className="alert alert-success alert-dismissible fade show">
            <button onClick={this.handleAlert} type="button" className="close" data-dismiss="alert">&times;</button>
            <strong>¡Has iniciado sesión exitosamente!</strong>
          </div>
        }))
      })
      .catch(error => {
        console.log(`Error ${error.code}: ${error.message}`)
        this.setState(() => ({
          alert: <div className="alert alert-danger alert-dismissible fade show">
            <button onClick={this.handleAlert} type="button" className="close" data-dismiss="alert">&times;</button>
            <strong>¡No se ha podido iniciar sesión!</strong>
          </div>
        }))
      });

    //let user = {}
    //const dbRef = firebase.database().ref('users').dbRef.push().set(user);

  }

  handleAlert() {
    this.setState(() => ({
      alert: null
    }))
  }

  handleLogOut() {
    this.setState({
      alert: <div className="alert alert-success alert-dismissible fade show">
        <button onClick={this.handleAlert} type="button" className="close" data-dismiss="alert">&times;</button>
        <strong>¡Has cerrado sesión exitosamente!</strong>
      </div>
    })
    firebase.auth().signOut();
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
    if (this.state.user)
      if (document.getElementById("Ptopic").value !== "" && document.getElementById("Pmessage").value !== "") {
        let date = new Date();

        let UID = "Y" + date.getFullYear() + "M" + (date.getMonth() + 1) + "D" + date.getDate() + "H" + date.getHours() + "Mi" + date.getMinutes() + "S" + date.getSeconds() + "m" + date.getMilliseconds() + "";

        let post = {
          uid: this.state.user.uid,
          uname: this.state.user.displayName,
          upic: this.state.user.photoURL,
          topic: document.getElementById("Ptopic").value,
          message: document.getElementById("Pmessage").value,
          likes: [],
          comments: [],
          date: "" + date + "",
          timeStamp: UID,
          type: this.state.visible
        }
        firebase.database().ref('posts/').push().set(post);
        document.getElementById("Ptopic").value = ""
        document.getElementById("Pmessage").value = ""
        this.setState(() => ({
          visible: "Público",
          alert: <div className="alert alert-success alert-dismissible fade show">
            <button onClick={this.handleAlert} type="button" className="close" data-dismiss="alert">&times;</button>
            <strong>¡Has posteado exitosamente!</strong>
          </div>
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
  handleFilter() {
    if (this.state.filter === "Todos") {
      this.setState((e) => ({
        filter: "Mis privados"
      }))
    } else if (this.state.filter === "Mis privados") {
      this.setState((e) => ({
        filter: "Sólo seguidores"
      }))
    } else {
      this.setState((e) => ({
        filter: "Todos"
      }))
    }
  }

  componentDidUpdate() {
    for (let i = 0; i < document.getElementsByClassName("buttonPost").length; i++) {
      document.getElementsByClassName("buttonPost")[i].setAttribute("onClick", "postId('" + document.getElementsByClassName("buttonPost")[i].getAttribute("id") + "')")
    }
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

  handleLike() {
    if (firebase.database().ref('posts/' + localStorage.getItem("idPost") + "/likes"))
      firebase.database().ref('posts/' + localStorage.getItem("idPost") + "/likes/" + this.state.user.uid).update({ uid: this.state.user.uid })
    else
      firebase.database().ref('posts/' + localStorage.getItem("idPost") + "/likes/" + this.state.user.uid).set({ uid: this.state.user.uid })
  }

  handleComment() {
    if (firebase.database().ref('posts/' + localStorage.getItem("idPost") + "/comments"))
      firebase.database().ref('posts/' + localStorage.getItem("idPost") + "/comments").push().update(
        { uid: this.state.user.uid, upic: this.state.user.photoURL, uname: this.state.user.displayName, text: document.getElementById("comment" + localStorage.getItem("idPost")).value }
      )
    else
      firebase.database().ref('posts/' + localStorage.getItem("idPost") + "/comments").push().set(
        { uid: this.state.user.uid, upic: this.state.user.photoURL, uname: this.state.user.displayName, text: document.getElementById("comment" + localStorage.getItem("idPost")).value }
      )
  }

  handleCommentModal() {
    if (this.state.CommentModal === "show")
      this.setState({
        CommentModal: " "
      })
    else
      this.setState({
        CommentModal: "show"
      })
  }

  handleFollow() {
    firebase.database().ref('posts/' + localStorage.getItem("idPost") + "").on("value", (snapshot) => {
      if (snapshot.val() !== null) {
        firebase.database().ref('users/' + snapshot.val().uid + "/followers/" + this.state.user.uid).update({ uid: this.state.user.uid })
        this.setState({
          alert: <div className="alert alert-info alert-dismissible fade show">
            <button onClick={this.handleAlert} type="button" className="close" data-dismiss="alert">&times;</button>
            <strong>{"¡Estas siguiendo al autor este post!"}</strong>
          </div>
        })

      }
    })
  }

  renderPost(newVariable) {
    let comments = []
    if (newVariable.val().comments) {
      Object.keys(newVariable.val().comments).map(c => {
        return firebase.database().ref('posts/' + newVariable.key + "/comments/" + c).orderByKey().on("value", (snapshot) => {
          if (snapshot.val() !== null) {
            comments.reverse().push(
              <div key={newVariable.key + snapshot.key} style={{ paddingTop: 1 + "%" }} className="comment_ margin1">
                <div className="comm">
                  <img style={{ width: 70 + "%", marginRight: 1 + "% !important", marginTop: 4 + "% !important" }} className="rounded mx-auto grid-i" src={snapshot.val().upic} alt="User-pic" />
                  <div className="grid-i">
                    <h4 style={{ textAlign: "left !important", fontSize: 0.8 + "rem", margin: 1 + "% !important" }} className="card-title">{snapshot.val().uname}</h4>
                  </div>
                </div>
                <p style={{ marginLeft: 1 + "%" }} className="card-text ">{snapshot.val().text}</p>
              </div>
            )
          }
        })
      })
    }
    return (
      <div key={newVariable.key} id={newVariable.key} className="card">

        <div className="card-header">
          <img style={{ width: 90 + "%", marginRight: 1 + "% !important" }} className="img-thumbnail mx-auto grid-i" src={newVariable.val().upic} alt="User-pic" />
          <div className="grid-i">
            <h4 style={{ textAlign: "left !important", fontSize: 1 + "rem" }} className="card-title">{newVariable.val().uname}</h4>
            <h6 style={{ fontSize: 0.7 + "rem", color: "grey" }} className="text-left">{newVariable.val().date}</h6>
          </div>
          <h3 className="card-title grid-i">{newVariable.val().topic}</h3>
        </div>
        <div className="card-body">
          <p className="card-text">{newVariable.val().message}</p>
        </div>
        <div className="text-right" style={{ marginRight: 1 + "%", marginBottom: 1 + "%" }}>
          {this.state.user ?
            <button id={newVariable.key} className="btn btn-info buttonPost" type="button" onClick={this.handleFollow}>Seguir Autor</button>
            : ""}
          <button id={newVariable.key} type="button" className="btn btn-outline-secondary dropdown-toggle buttonPost" data-toggle="dropdown" onClick={this.handleCommentModal}>Comentarios <small>{newVariable.val().comments ? Object.keys(newVariable.val().comments).length : 0}</small></button>

          <div className={localStorage.getItem("idPost") === newVariable.key ? "dropdown-menu dropdown-menu-right " + this.state.CommentModal : "dropdown-menu dropdown-menu-right "} style={{ marginRight: 1 + "%", marginBottom: 1 + "%" }}>
            <div className="form-group margin1">
              {comments}
              {this.state.user ? <div>
                <textarea className="form-control" rows="1" id={"comment" + newVariable.key} type="text" placeholder="Comentario..." />
                <button className="btn btn-dark " type="button" onClick={this.handleComment}>Comentar</button>
              </div>
                : ""}
            </div>
          </div>
          {this.state.user ?
            <button type="button" id={newVariable.key} className="btn btn-primary buttonPost" onClick={this.handleLike}>Me gusta <small>{newVariable.val().likes ? Object.keys(newVariable.val().likes).length : 0}</small></button>
            : ""}
        </div>

      </div>
    )
  }

  render() {
    if (this.state.user)
      localStorage.setItem("CurrentUser", this.state.user.uid)

    const posts = this.state.posts.map(newVariable => {

      let filterFlag = false
      if (this.state.filter === "Todos") {
        if (this.state.user) {
          if ((newVariable.val().type === "Público") || (newVariable.val().type === "Privado" && newVariable.val().uid === this.state.user.uid)) {
            filterFlag = true
          } else if (newVariable.val().type === "Sólo seguidores") {
            firebase.database().ref("users/" + newVariable.val().uid).once("value").then(function (snapshot) {
              if (snapshot.child("followers/" + localStorage.getItem("CurrentUser")).exists()) {

                 this.renderPost(newVariable)
              }
            })
          }
        }
        else if (newVariable.val().type === "Público") {
          filterFlag = true
        }
      } else if (this.state.filter === "Mis privados") {
        if (this.state.user) {
          if (newVariable.val().type === "Privado" && newVariable.val().uid === this.state.user.uid) {
            filterFlag = true
          }
        }
      } else if (newVariable.val().type === "Sólo seguidores") {
        if (this.state.user) {
          firebase.database().ref("users/" + newVariable.val().uid).once("value").then(function (snapshot) {
            if (snapshot.child("followers/" + localStorage.getItem("CurrentUser")).exists()) {
               this.renderPost(newVariable)
            }
          })
        }
      }
      if (filterFlag) {
        return this.renderPost(newVariable)
      } else {
        return (null)
      }
    }).reverse()

    return (
      <div id="App" className="App">
        {/*
        <header className="App-header">
          <h1 className="App-title">Mi Proyecto</h1>
        </header>
        */}
        <nav className="navbar navbar-expand-md bg-dark navbar-dark">
          <a className="navbar-brand" href="#App">Así como estaba :v</a>
          {this.state.user ?
            <div type="button" className="logoutButton" onClick={this.handleLogOut}>
              <img style={{ width: 7 + "vmin" }} className="rounded mx-auto" src={this.state.user.photoURL} alt="User-pic" />
              <p style={{ fontSize: 1 + "vim", color: "white" }}>¡Hola, {this.state.user.displayName}!</p>
            </div>
            :
            <button className="btn btn-primary loginButton" type="button" onClick={this.handleAuth}>Iniciar sesión</button>
          }
        </nav>
        <div id="Desk">
          {this.state.alert ? this.state.alert : ''}
          {this.state.user ?
            <div>
              <div style={{ marginRight: 5 + "%", marginLeft: 5 + "%", marginTop: 2.5 + "%", marginBottom: 0 + "%", paddingBottom: 5 + "%" }} className="form-group">
                <input className="form-control" id="Ptopic" type="text" placeholder="Tema" />
                <textarea className="form-control" rows="5" id="Pmessage" type="text" placeholder="Cuerpo de la publicación..." />
              </div>
              <button className="btn btn-outline-dark" type="button" onClick={this.handleVisible}>{this.state.visible}</button>
              <button className="btn btn-success" type="button" onClick={this.handlePost}>Postear</button>
            </div>
            : ""}
          <div id="board" className="card">
            <button className="btn btn-dark" type="button" onClick={this.handleFilter}>{this.state.filter}</button>
            {posts}
          </div>
          {/*this.renderLogginButton()*/}
        </div>
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