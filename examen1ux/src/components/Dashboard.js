import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { CardHeader, Avatar, IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';


const styles = {
  card: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
};

class Dashboard extends Component {
  classes = {};
  constructor(props){
    super(props)
    this.classes = props.classes;
  }
  prueba(){
    console.log('aaaa');
  }

  render() {
    return (
      <div>
      <Card className={this.classes.card}>
      <CardHeader
            avatar={
              <Avatar aria-label="Recipe" className={this.classes.avatar}>
                R
              </Avatar>
            }
            action={
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            }
            title="Shrimp and Chorizo Paella"
            subheader="September 14, 2016"
          />
        <CardMedia
          className={this.classes.media}
          image="/static/images/cards/contemplative-reptile.jpg"
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Lizard
          </Typography>
          <Typography component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions>
      </Card>
      </div>
    );
  }

  
  /*
  <Card>
            
            <CardTitle title="Card title" subtitle="Card subtitle" />
            <CardText>
              <TextField
                id = "data"
                hintText="Hint Text"
                floatingLabelText="Floating Label Text"
              />
            </CardText>
            <CardActions>
              <RaisedButton label="Action1" />
              <RaisedButton label="Action2" primary={true} onClick={() => { this.prueba(); }}/>
            </CardActions>
          </Card>
  */
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
