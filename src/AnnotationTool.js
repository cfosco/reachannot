import React, { Component } from 'react';
import { withStyles, MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { Button, Popover, Typography, Radio, FormLabel, FormControlLabel, RadioGroup, FormControl} from '@material-ui/core';
import imageData from './jsons/json_0.json';
import $ from 'jquery';
import { Progress } from 'react-sweet-progress';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import "react-sweet-progress/lib/style.css";
import Example1 from './annotationIllustration_interactability.png';

import { Dropbox } from 'dropbox';
const accessToken = 'k9n1fRo2LjEAAAAAAAAAAXmXzQSKciAEM7-5Z0fjWVXbmPP3szQ-cwReXu2f-Rcn';
const dbx = new Dropbox({
  accessToken
});

const MTURK_SUBMIT_SUFFIX = "/mturk/externalSubmit";

const Handle = Slider.Handle;
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100vw',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  irb: {
    width: "70%",
    textAlign: "center",
    padding: 16,
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  startButton: {
    borderRadius: 16,
    fontSize: 36,
    margin: 8,
  },
  levelProgress: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  mainImageSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    boxShadow: "1px 3px 10px #9E9E9E"
  },
  markedAreaSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    boxShadow: "1px 3px 10px #9E9E9E"
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    margin: 16,
  },
  gifContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  brushSizeContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
});

const THEME = createTheme({
  typography: {
   "fontFamily": "'Raleway', sans-serif",
   "fontSize": 14,
   "fontWeightLight": 100,
   "fontWeightRegular": 100,
   "fontWeightMedium": 100
  }
});

// const maxVideoDuration = 3;

class AnnotationTool extends Component {
  constructor(props){
    super(props);
    this.state = {
      anchorEl: null,
      brushSize: 12,
      buttonText: "SUBMIT",
      coordinateData: [],
      currentLevel: 0,
      currentIndex: 0,
      data: {},
      disabled: true,
      maxLevels: Object.keys(imageData).length,
      maxImages: imageData[0].length,
      mousedownStart: [],
      percent: 0,
      seen: {},
      timer: Date.now(),
      imageData: imageData,
      mouseDown: false,
      brushType: 0  // 0 = reachable, 1 = most likely to be reached
    };

    this.markedCanvasRef = React.createRef();
    this.mainCanvasRef = React.createRef();
    this.imageRef = React.createRef();

    this.colors = [[0, 255, 0], [255, 0, 0]]
    this.imageWidth = 600
    this.imageHeight = 400
    this.sizeFactor = 0.7

    this._handleClick = this._handleClick.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleNextButton = this._handleNextButton.bind(this);
    this._handleSubmitButton = this._handleSubmitButton.bind(this);
    this._loadNextImage = this._loadNextImage.bind(this);
    this._submitHITform = this._submitHITform.bind(this);
    this._updateCanvas = this._updateCanvas.bind(this);
    this._clearCanvasAnnotations = this._clearCanvasAnnotations.bind(this);
  }

  componentDidMount() {
    // document.getElementById('instruction-button').click();
    const markedAreasCanvas = this.markedCanvasRef.current;
    const mainCanvas = this.mainCanvasRef.current;
    const markedAreasCtx = markedAreasCanvas.getContext("2d");
    const mainCtx = mainCanvas.getContext("2d");
    const img = this.imageRef.current;

    var i;

    if (this.state.maxLevels > 1) {
      this.state.buttonText = "NEXT LEVEL";
      console.log(this.state.buttonText);
    }

    if (this.state.coordinateData.length === 0) {
        this._updateCanvas(markedAreasCtx, img, this.imageWidth*this.sizeFactor, this.imageHeight*this.sizeFactor, this.sizeFactor);   
        this._updateCanvas(mainCtx, img, this.imageWidth, this.imageHeight);       

    }
    

    mainCanvas.addEventListener('click', () => {
      clearInterval(this.interval);
      i = window.setInterval(() => {

        this._updateCanvas(markedAreasCtx, img, this.imageWidth*this.sizeFactor, this.imageHeight*this.sizeFactor, this.sizeFactor);   
        // this._updateCanvas(mainCtx, img, this.imageWidth, this.imageHeight);       

      }, 20)
    }, false);

    mainCanvas.addEventListener('mousemove', (e) => {
        // clearInterval(this.interval);
        setTimeout(() => {
          // mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        // Show the outline of the brush while moving on the Canvas
          var x1 = e.offsetX
          var y1 = e.offsetY
          var [r, g, b] = this.colors[this.state.brushType];
          if (!this.state.mouseDown) {
            mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
          }
          mainCtx.beginPath();
          mainCtx.arc(x1, y1, this.state.brushSize, 0, 2 * Math.PI, false);
          mainCtx.fillStyle="rgb(" + r + ", " + g + ", " + b + ", 0.4)";
          mainCtx.fill();
        });
        mainCanvas.onmouseleave = () => {        
          this.state.mouseDown = false;
          mainCanvas.onmousemove = null;
          mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
          mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
        }

    }, false)

    mainCanvas.addEventListener("mousedown", (e) => {
      clearInterval(this.interval);
      this.state.mouseDown = true;

      if (!this.state.seen[[e.offsetX, e.offsetY, this.state.brushType]]) {
        this.state.coordinateData.push([e.offsetX, e.offsetY, this.state.brushType, this.state.brushSize]);
        this.state.seen[[e.offsetX, e.offsetY, this.state.brushType]] = true;
      }
      mainCanvas.onmousemove = (e2) => {
        setTimeout(() => {
          if (!this.state.seen[[e2.offsetX, e2.offsetY, this.state.brushType]]) {
            this.state.coordinateData.push([e2.offsetX, e2.offsetY, this.state.brushType, this.state.brushSize]);
            this.state.seen[[e2.offsetX, e2.offsetY, this.state.brushType]] = true;
          }

          this._updateCanvas(markedAreasCtx, img, this.imageWidth*this.sizeFactor, this.imageHeight*this.sizeFactor, this.sizeFactor);   
          // this._updateCanvas(mainCtx, img, this.imageWidth, this.imageHeight);       
  
        });
      }
      mainCanvas.onmouseleave = () => {
        // mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        // mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
        this.state.mouseDown = false;
        mainCanvas.onmousemove = null;
      }
    }, false);

    mainCanvas.addEventListener("mouseup", (e) => {
      this.state.mouseDown = false;
      mainCanvas.onmousemove = null;
      // this._clearCanvasAnnotations(markedAreasCtx, img);

    }, false);

    var url = window.location.href;
    var identifier = "data";
    if (url.indexOf(identifier) > 0) {
      var file = this._gup(identifier);
      var data = require('./' + file + '.json');
      this.setState({imageData: data}, () => this.setState({
        maxLevels: Object.keys(this.state.imageData).length,
        maxImages: this.state.imageData[0].length,
        percent: Math.round(Math.min((0) / this.state.imageData[0].length * 100, 100)),
      }))
    }
  }

  componentDidUpdate(){}

  _updateCanvas(ctx, img, w=600, h=400, scale=1) {
    ctx.drawImage(img, 0, 0, w, h)
    for (let j = 0; j < this.state.coordinateData.length; j++) {
      var [x1, y1, brushType, brushSize] = this.state.coordinateData[j];
      var [r, g, b] = this.colors[brushType];
      ctx.beginPath();
      ctx.arc(x1*scale, y1*scale, brushSize*scale, 0, 2 * Math.PI, false);
      ctx.fillStyle="rgb(" + r + ", " + g + ", " + b + ", 0.5)";
      ctx.fill();
    }
  }


  _clearCanvasAnnotations(ctx, img, w=600, h=400) {
    ctx.drawImage(img, 0, 0, w, h)
  }

  _handleClick(e) {
    this.setState({anchorEl: e.currentTarget});
  }

  _handleClose() {
    this.setState({anchorEl: null});
  }


  _generateColors(start, end, n) {

    var steps = [
      (end[0] - start[0]) / n,
      (end[1] - start[1]) / n,
      (end[2] - start[2]) / n
    ];

    var colors = [start];
    for(var ii = 0; ii < n - 1; ++ii) {
      colors.push([
        Math.floor(colors[ii][0] + steps[0]),
        Math.floor(colors[ii][1] + steps[1]),
        Math.floor(colors[ii][2] + steps[2])
      ]);
    }
    colors.push(end);

    return colors;
  };

  _handleNextButton() {
    if (this.state.coordinateData.length === 0) {
      alert("You have not marked the image yet. Please do so before continuing");
      return;
    } else if (this.state.coordinateData.length < 10) {
      alert("The image was not properly marked. Please perform the task properly.");
      return;
    }
    clearInterval(this.interval);
    this.setState({
      percent: this.state.percent + 100/this.state.maxImages,
    }, () => this._loadNextImage());
  }

  _handleSubmitButton() {
    clearInterval(this.interval);

    if (this.state.buttonText === "NEXT LEVEL") {
      this._loadNextLevel();
    } else if (this.state.buttonText === "SUBMIT") {

      // Handle Dropbox submit
      var myJSON = JSON.stringify(this.state.data);
      dbx.filesUpload({path: '/' + this._makeid(20) + '.json', contents: myJSON})
      //  .then(function(response) {
      //    alert("Thank you for completing the game.");
      //  })
       .catch(function(error) {
         console.log("error: ", error);
       });

      // Handle Mturk Submit
      this._submitHITform();
    }
  }

  _submitHITform() {
    this.setState({disabled: true, overclick: true});
    var submitUrl = decodeURIComponent(this._gup("turkSubmitTo")) + MTURK_SUBMIT_SUFFIX;
    var form = $("#submit-form");

    console.log("Gup output for assignmentId, workerId:", this._gup("assignmentId"),this._gup("workerId"))
    this._addHiddenField(form, 'assignmentId', this._gup("assignmentId"));
    this._addHiddenField(form, 'workerId', this._gup("workerId"));
    this._addHiddenField(form, 'taskTime', (Date.now() - this.state.timer)/1000);
    this._addHiddenField(form, 'feedback', $("#feedback-input").val());

    // var results = {
    //     'outputs': this.state.data,
    // };

    console.log("Submitting the following data:", this.state.data);

    // this._addHiddenField(form, 'results', JSON.stringify(this.state.data));
    // $("#submit-form").attr("action", submitUrl);
    // $("#submit-form").attr("method", "POST");
    // $("#submit-form").submit();
  }

  _gup(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results == null) return "";
    else return results[1];
  }

  _addHiddenField(form, name, value) {
    // form is a jQuery object, name and value are strings
    var input = $("<input type='hidden' name='" + name + "' value=''>");
    input.val(value);
    form.append(input);
  }

  _loadNextImage() {

    var key = this.state.currentIndex;
    var imageURL = this.state.imageData[this.state.currentLevel][this.state.currentIndex];
    this.state.data[imageURL] = this.state.coordinateData;
    // this.state.data[key] = {[imageURL]: this.state.coordinateData};

    if (this.state.percent === 100) {
      this.setState({disabled: false})
      if (this.state.currentLevel >= this.state.maxLevels - 1) {
        this.setState({buttonText: 'SUBMIT'})
        return;
      }
      return;
    }
    this.setState({
      currentIndex: this.state.currentIndex + 1,
      coordinateData: [],
    })
  }


  _loadNextLevel() {
    this.setState({
      currentLevel: this.state.currentLevel + 1,
      percent: 0,
      currentIndex: 0,
      disabled: true,
      coordinateData: [],
    })
  }

  // _handlePlayButton() {
  //   const vid = this.imageRef.current;
  //   if (vid.paused) {
  //     this.setState({pause: false});
  //     vid.play();
  //   } else {
  //     this.setState({pause: true});
  //     vid.pause();
  //   }
  // }

  _makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  render() {
    const { classes } = this.props;
    const { buttonText, disabled, imageData,
            percent, currentLevel, currentIndex,
            maxLevels, anchorEl, brushSize } = this.state;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    return (
      <MuiThemeProvider theme={THEME}>
        <div className={classes.root}>
          <div className={classes.topSection}>
            <Typography variant="h2" style={{marginBottom: 16}}>
                Annotation Tool - Reachability Experiment
            </Typography>
            <Button id="instruction-button" variant="contained" color="primary" onClick={this._handleClick}>Instructions</Button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={this._handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              style={{flexDirection: "row"}}
            >
              <Button id="close-instruction-button" variant="contained" align="right" color="secondary" onClick={this._handleClose}>X</Button>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Typography variant="subtitle1" align="left" style={{padding: 16}}>
                  <h3>Instructions</h3>
                      In this experiment, you will be asked to annotate parts of reachable environments, to indicate how someone might interact with them.
                      < br/>
                      
                      <ul>
                      <li>First, please indicate ALL objects or elements that someone could interact with their hands. Imagine the picture is someone's viewpoint - what are all the components that they could act on from that position?
                      </li>
                      <li>
                      Next, indicate only the subset of objects or elements that are most likely to be interacted with. Ask yourself: in a standard interaction, what subset of objects would I focus my actions on?
                      </li>
                      </ul>

                      Sometimes it might be hard to choose which annotations to use, or you may not be familiar with the environment in the photo, but just make your best guess.
                      < br/>
                      < br/>
                <div className={classes.gifContainer}>
                  <img src={Example1} style={{width: "40%"}} />
                </div>
                  <h3>General Guidelines</h3>
                      Here are some things to keep in mind: 

                      <ul>
                      <li>There may be some overlap in the two annotations, that is ok.
                      </li>
                      <li>
                      When adding the annotations, make sure to consider any element that could be relevant to the activity you would perform in the space, including buttons or knobs, not just objects.
                      </li>
                      <li>
                      There is no time limit per image.
                      </li>
                      <li>
                      If there are watermarks on the image, please ignore them while making your annotation.
                      </li>
                      </ul>
                </Typography>

              </div>
              
            </Popover>
            {maxLevels>1 && 
            <Typography variant="h5" style={{marginTop: 32, marginBottom: 12}}>
              Current Level: {currentLevel + 1} / {maxLevels}
            </Typography> }
            <div className={classes.levelProgress} style={{marginTop: 32, marginBottom: 12}}>
              <Typography variant="caption">
                Progress:
              </Typography>
              <Progress
                style={{width: '70%', marginLeft: 8}}
                percent={Math.ceil(percent)}
                theme={{
                  active: {
                    symbol: Math.ceil(percent) + '%',
                    color: 'green'
                  },
                  success: {
                    symbol: Math.ceil(percent) + '%',
                    color: 'green'
                  }
                }}
              />
            </div>
          </div>
          <div className={classes.imageSection}>
            
            {/* ##### MAIN IMAGE SECTION ##### */}
            <div className={classes.mainImageSection}>
              <Typography variant="h5">
                Main Image (Click Here)
              </Typography>
              <br/>
              <canvas id="myCanvas" ref={this.mainCanvasRef} width={this.imageWidth} height={this.imageHeight} />
              <img
                id="myImage"
                draggable="false"
                onDragStart={() => {return false;}}
                src={imageData[currentLevel][currentIndex]}
                width={0}
                height={0}
                ref={this.imageRef}
              />
              <div className={classes.brushSizeContainer}>
                <div style={{marginTop: 12, marginRight: 15}}>
                  <Typography variant="subtitle1">
                    Adjust Brush Size ({brushSize} px):
                  </Typography>
                  <Slider style={{marginTop: 12}} min={3} max={24} defaultValue={brushSize} handle={handle}
                      onChange={(val) => this.setState({brushSize: val})} />
                      {/* <Box sx={{ p: brushSize, border: '3px solid black' }}/> */}
                </div>

                <FormControl style={{marginTop: 12, marginLeft: 15, width: "40%"}}>
                  <FormLabel id="demo-radio-buttons-group-label" >Annotation type</FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="reachable"
                    name="radio-buttons-group"
                    onChange={(e) => this.setState({brushType: e.target.value === "reachable" ? "0" : "1"})}
                  >
                    <FormControlLabel value="reachable" control={<Radio color="grey"/>} label="Reachable" />
                    <FormControlLabel value="most_likely_reachable" control={<Radio color="grey"/>}  label="Most likely to be interacted with" />
                  </RadioGroup>
                </FormControl>
              </div>
            </div>

            {/* ##### MARKED AREA SECTION ##### */}
            <div className={classes.markedAreaSection}>
              <Typography variant="h5">
                Areas You've Marked
              </Typography>
              <br/>
              <canvas id="markedCanvas" ref={this.markedCanvasRef} width={this.imageWidth*this.sizeFactor} height={this.imageHeight*this.sizeFactor} />
              <Button variant="contained" style={{borderRadius: 16, fontSize: 16, margin: 8}} onClick={() => this.setState({coordinateData: []})}>
                Clear Marks
              </Button>
            </div>


          </div>

          <div style={{display: 'flex', flexDirection: 'row'}}>
            <Button disabled={!disabled} variant="contained" className={classes.startButton} onClick={this._handleNextButton}>
              NEXT
            </Button>
            <Button disabled={disabled} variant="contained" className={classes.startButton} onClick={this._handleSubmitButton}>
              {buttonText}
            </Button>
          </div>
          <Typography>
            You must mark the image before being able to click 'Next'.
          </Typography>
          <form id="submit-form" name="submit-form">
          </form>
          <Typography className={classes.irb} variant="caption">
            This HIT is part of a MIT scientific research project. Your decision to complete this HIT is voluntary. There is no way for us to identify you. The only information we will have, in addition to your responses, is the time at which you completed the study. The results of the research may be presented at scientific meetings or published in scientific journals. Clicking on the 'SUBMIT' button on the bottom of this page indicates that you are at least 18 years of age and agree to complete this HIT voluntarily.
          </Typography>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(AnnotationTool);