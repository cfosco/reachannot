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
// const accessToken = 'sl.BO0BN17alXUXoQXzzzz01vNiFAzoKAR604h5grOwXTTV1b2454BWrIX1tmgWRyzp7C61PyicZloso3ObyR_zTd8RCcnP06PK4IcqCi4itCbqQdGfE2qkaTr7aQgP1ehjVsSy1_8';
const accessToken = '0_m4r5qdxpQAAAAAAAAAAdAu_PnzOISv1yIJ8PE_EcgTLUnJIawNOKrxtyO3Odo_';
const dbx = new Dropbox({
  accessToken
});

const MTURK_SUBMIT_SUFFIX = "/mturk/externalSubmit";

const currURL = window.location.search;
const urlParams = new URLSearchParams(currURL);
const subject_id = urlParams.get('PROLIFIC_PID');
const study_id = urlParams.get('STUDY_ID');
const session_id = urlParams.get('SESSION_ID');
console.log(subject_id)
console.log(study_id)
console.log(session_id)

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
    textAlign: "center",
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
    textAlign: "left",
  },
    demoSurveySection: {
    width: "70%",
    textAlign: "center",
    padding: 16,
    // display: "none",
  },
  ejectorPage: {
    width: "70%",
    textAlign: "center",
    padding: 16,
    // display: "none",
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
      brushSize: 20,
      buttonText: "SUBMIT",
      nextButtonText: "NEXT",
      coordinateData: [],
      currentLevel: 0,
      currentIndex: 0,
      data: {},
      nextDisabled: false,
      submitDisabled: true,
      maxLevels: Object.keys(imageData).length,
      maxImages: imageData[0].length,
      mousedownStart: [],
      percent: 0,
      seen: {},
      timer: Date.now(),
      imageData: imageData,
      mouseDown: false,
      brushType: 0,  // 0 = most likely to be reached, 1 = reachable 
      showDemographics: false,
      showEjector: false,
      timeBeforeEnablingNext: 800, // TIME IN EACH TRIAL BEFORE NEXT BUTTON IS ENABLED, usually 8000
      mistakeCtr: 0, // how many times have they tried to move on without painting?
    };

    this.markedCanvasRef = React.createRef();
    this.mainCanvasRef = React.createRef();
    this.imageRef = React.createRef();
    this.nextButtonRef = React.createRef();

    this.colors = [[0, 255, 0], [255, 0, 0]]
    this.imageWidth = 600
    this.imageHeight = 400
    this.sizeFactor = 0.7
    this.state.data.demographics = {}
    
    this.state.data.subject_id = subject_id
    this.state.data.study_id = study_id
    this.state.data.session_id = session_id
  
    this._handleClick = this._handleClick.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleNextButton = this._handleNextButton.bind(this);
    this._handleSubmitButton = this._handleSubmitButton.bind(this);
    this._loadNextImage = this._loadNextImage.bind(this);
    this._updateCanvas = this._updateCanvas.bind(this);
    this._clearCanvasAnnotations = this._clearCanvasAnnotations.bind(this);
    this._handleNextLevelButton = this._handleNextLevelButton.bind(this);
    
    this.onChangeAge = this.onChangeAge.bind(this);
    this.onChangeGender = this.onChangeGender.bind(this);
    this.onChangeRace = this.onChangeRace.bind(this);
    this.onChangeEthn = this.onChangeEthn.bind(this);
  }

  componentDidMount() {
    // document.getElementById('instruction-button').click();
    const markedAreasCanvas = this.markedCanvasRef.current;
    const mainCanvas = this.mainCanvasRef.current;
    const markedAreasCtx = markedAreasCanvas.getContext("2d");
    const mainCtx = mainCanvas.getContext("2d");
    const img = this.imageRef.current;

    const nextButton = this.nextButtonRef.current;

    var i;

    if (this.state.maxLevels > 1) {
      this.state.buttonText = "NEXT LEVEL";
    }

    if (this.state.coordinateData.length === 0) {        
        mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
        this._updateCanvas(markedAreasCtx, img, this.imageWidth*this.sizeFactor, this.imageHeight*this.sizeFactor, this.sizeFactor);   
    }

    // img.onloadeddata = () => {
    //     mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
    //     this._updateCanvas(markedAreasCtx, img, this.imageWidth*this.sizeFactor, this.imageHeight*this.sizeFactor, this.sizeFactor);
    // }

    mainCanvas.addEventListener('click', () => {
      clearInterval(this.interval);

      i = window.setInterval(() => {

        this._updateCanvas(markedAreasCtx, img, this.imageWidth*this.sizeFactor, this.imageHeight*this.sizeFactor, this.sizeFactor);   
        // this._updateCanvas(mainCtx, img, this.imageWidth, this.imageHeight);  
        
      }, 20)
    }, false);

    mainCanvas.addEventListener('mousemove', (e) => {

        clearInterval(this.interval);
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
          console.log("mouseleave in mousemove")
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
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
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
      //need this because of weird prolific sandbox formatting
      if (file.includes('?PROLIFIC_PID')){
    		var idx = file.indexOf('?')
    		file = file.substring(0,idx)
      }
      var data = require('./jsons/' + file);
      this.setState({imageData: data}, () => this.setState({
        maxLevels: Object.keys(this.state.imageData).length,
        maxImages: this.state.imageData[0].length,
        percent: Math.round(Math.min((0) / this.state.imageData[0].length * 100, 100)),
      }))
    }
  }

  componentDidUpdate(){}

  _updateCanvas(ctx, img, w=600, h=400, scale=1) {
    // console.log(img)
    ctx.drawImage(img, 0, 0, w, h)
    var max_points = 450
    var step = Math.ceil(this.state.coordinateData.length / max_points)
    for (let j = 0; j < this.state.coordinateData.length; j+=step) {
      var [x1, y1, brushType, brushSize] = this.state.coordinateData[j];
      var [r, g, b] = this.colors[brushType];
      ctx.beginPath();
      ctx.arc(x1*scale, y1*scale, brushSize*scale, 0, 2 * Math.PI, false);
      ctx.fillStyle="rgb(" + r + ", " + g + ", " + b + ", 0.5)";
      ctx.fill();
    }
  }

  _updateMainCanvas(ctx, img, w=600, h=400, scale=1) {
    // draw image
    ctx.drawImage(img, 0, 0, w, h)

    // draw current 
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
    console.log(this.state.maxImages)
    console.log(this.state.maxLevels)
    console.log(this.state.currentLevel)
    console.log(this.state.percent)
    if (this.state.coordinateData.length === 0 && this.state.currentIndex > 0 && this.state.currentIndex < this.state.maxImages*2/3) {
		console.log(this.state.mistakeCtr+1)
		this.state.mistakeCtr = this.state.mistakeCtr+1
    }
    
    if (this.state.mistakeCtr === 3) {
		this.setState({showEjector: true})
    }
    
    if (this.state.coordinateData.length === 0) {
      alert("You have not marked the image yet. Please do so before continuing");
      return;
    } else if (this.state.coordinateData.length < 10) {
      alert("The image was not properly marked. Please perform the task correctly.");
      return;
    } else {
      // Check if coordinateData has elements with both brushTypes
//       console.log(this.state.coordinateData)
//       var hasType1 = false;
//       var hasType2 = false;
//       for (let i=0, len=this.state.coordinateData.length; i<len; i++) {
//         if (this.state.coordinateData[i][2] === 0) {
//           hasType1 = true;
//         }
//         else if (this.state.coordinateData[i][2] === 1) {
//           hasType2 = true;
//         }
//       }
//   
//       if (!hasType1) {
//         alert("The image was not properly marked. You have no annotations for the '1-5 objects you are most likely to interact with'.");
//         return;
//       }
//       else if (!hasType2) {
//         alert("The image was not properly marked. You have no annotations for 'all other objects it is possible to interact with'.");
//         return;
//       }
    }

    this.setState({
      percent: this.state.percent + 100/this.state.maxImages,
    }, () => this._loadNextImage());
    console.log(this.state.percent)
  }

  _handleNextLevelButton() {
    this._loadNextLevel();
  }

  _handleSubmitButton() {
    clearInterval(this.interval);

      console.log(this.state.data);
       
		var myJSON = JSON.stringify(this.state.data);
    dbx.filesUpload({path: '/' + this._makeid(20) + '.json', contents: myJSON})
      //  .then(function(response) {
      //    // redirect
      // 		window.location.href = "https://app.prolific.co/submissions/complete?cc=42FA8357";  // XXX
      //  }) // XXX
       .catch(function(error) {
         console.log("error: ", error);
       });
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

    this.setState({nextButtonText: "Move mouse over image to start"});

    this.setState({nextDisabled: true});
    setTimeout(() => {
      console.log("timeout")
      this.setState({nextButtonText: "NEXT"});
      this.setState({nextDisabled: false});
      }, this.state.timeBeforeEnablingNext);


    var key = this.state.currentIndex;
    var imageURL = this.state.imageData[this.state.currentLevel][this.state.currentIndex];
    this.state.data[imageURL] = this.state.coordinateData;
    // this.state.data[key] = {[imageURL]: this.state.coordinateData};
    
    // Draw the image once to avoid lag
    const img = this.imageRef.current

    const mainCanvas = this.mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext("2d");
    img.onloadeddata = () => {
      console.log("Drawing image");
      mainCtx.drawImage(img, 0, 0, this.imageWidth, this.imageHeight)
  }
    if (this.state.percent >= 100) {
      this.setState({submitDisabled: false})
      if (this.state.currentLevel >= this.state.maxLevels - 1) {
        this.setState({showDemographics: true})
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
      submitDisabled: true,
      coordinateData: [],
    })
  }

  _makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  onChangeAge(event) {
    console.log(this.state.data.demographics);
    this.state.data.demographics["age"] = event.target.value;
  }
  onChangeGender(event) {
    console.log(event.target.value);
    this.state.data.demographics["gender"] = event.target.value;
  }
  onChangeRace(event) {
    console.log(event.target.value);
    this.state.data.demographics["race"] = event.target.value;
  }
  onChangeEthn(event) {
    console.log(event.target.value);
    this.state.data.demographics["ethnicity"] = event.target.value;
  }

  render() {
    const { classes } = this.props;
    const { buttonText, nextDisabled, submitDisabled, imageData, nextButtonText,
            percent, currentLevel, currentIndex,
            maxLevels, anchorEl, brushSize, showDemographics, showEjector } = this.state;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    return (
      <MuiThemeProvider theme={THEME}>
        <div className={classes.root}>
          {!showDemographics && !showEjector && <div>
          <div className={classes.topSection}>
            <Typography variant="h2" style={{marginBottom: 16}}>
                Interacting in Reachable Spaces
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
                      <li> Use the first color to indicate the subset of objects that were probably actively being used right before the photo was taken.
                      </li>
                      <li> Use the second color to indicate ALL of the remaining objects, which were not actively being used (like decorations or objects that were placed out of the way). 
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
                      <li> Try to reduce the overlap in the two annotations.
                      </li>
                      <li> You do not need to use both annotations on every image.
                      </li>
                      <li> When adding the annotations, make sure to consider any element that could be relevant to the activity you would perform in the space, including buttons or knobs, not just objects.
                      </li>
                      <li> There is no time limit per image.
                      </li>
                      <li> If there are watermarks on the image, please ignore them while making your annotation.
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
                Paint over the objects/components that you could physically interact with in this space
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
                  <Slider style={{marginTop: 12}} min={10} max={50} defaultValue={brushSize} handle={handle}
                      onChange={(val) => this.setState({brushSize: val})} />
                      {/* <Box sx={{ p: brushSize, border: '3px solid black' }}/> */}
                </div>

                <FormControl style={{marginTop: 12, marginLeft: 15, width: "50%"}}>
                  <FormLabel id="demo-radio-buttons-group-label" > If this was your point of view, please indicate:</FormLabel>
                  <br/>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="most_likely_reachable"
                    name="radio-buttons-group"
                    onChange={(e) => this.setState({brushType: e.target.value === "most_likely_reachable" ? 0 : 1})}
                  >
                    <FormControlLabel value="most_likely_reachable" 
                        control={<Radio color="primary" />} 
                        label="Any object that was probably actively engaged with" />
                    <FormControlLabel value="reachable" 
                    	control={<Radio color="secondary"/>}  
                    	label="ALL objects that were not being actively used (like decorations or objects that were placed out of the way)" />
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
            <Button ref={this.nextButtonRef} disabled={nextDisabled} variant="contained" className={classes.startButton} onClick={this._handleNextButton} style={{margin: 'auto'}}>
              {nextButtonText}
            </Button>
          </div>< br/>
          <Typography>
            You must mark the image before being able to click 'Next'.
          </Typography>
          < br/>
          <form id="submit-form" name="submit-form">
          </form>
          <Typography className={classes.irb} variant="caption">
            This HIT is part of a MIT scientific research project. Your decision to complete this HIT is voluntary. There is no way for us to identify you. The only information we will have, in addition to your responses, is the time at which you completed the study. The results of the research may be presented at scientific meetings or published in scientific journals. Clicking on the 'SUBMIT' button on the bottom of this page indicates that you are at least 18 years of age and agree to complete this HIT voluntarily.
          </Typography>

        </div>}
          
          {showDemographics && <div className={classes.demoSurveySection}>
            <Typography variant="h4">
                Thanks for participating
            </Typography>
            < br/>< br/>
            <Typography>
                If this is your first time completing the HIT, please fill out the demographic survey below. Otherwise, click SUBMIT to finish
            </Typography>
            < br/>< br/> 

            <div onChange={this.onChangeAge}>
              Please enter your <strong>age</strong> < br/>
              <input name="age" type="text" id="age"/>
            </div>
            < br/>< br/> 
            
            <div onChange={this.onChangeGender}>
              Please select your <strong>gender</strong> < br/>
              <input name="gender" type="radio" value="male" /> Male       
              <input name="gender" type="radio" value="female" /> Female       
              <input name="gender" type="radio" value="NB" /> Nonbinary      
              <input name="gender" type="radio" value="notReported" /> Not Reported      
            </div>
            < br/>< br/>
            
            <div onChange={this.onChangeRace}>
              Please select your <strong>race</strong> < br/>
              <input name="race" type="radio" value="AIAN" /> American Indian or Alaska Native      
              <input name="race" type="radio" value="Asian" /> Asian       
              <input name="race" type="radio" value="BlackAA" /> Black or African-American       
              <input name="race" type="radio" value="NHPI" /> Native Hawaiian/ Pacific Islander       
              <input name="race" type="radio" value="White" /> White       
              <input name="race" type="radio" value="MixedRace" /> More than one race       
              <input name="race" type="radio" value="notReported" /> Not Reported      
            </div>
            < br/>< br/>

            <div onChange={this.onChangeEthn}>
              Please select your <strong>ethnicity</strong> < br/>
              <input name="ethnicity" type="radio" value="hispanicLatino" /> Hispanic or Latino       
              <input name="ethnicity" type="radio" value="notHispanicLatino" /> Not Hispanic or Latino      
              <input name="ethnicity" type="radio" value="notReported" /> Not Reported      
            </div>
            < br/>< br/>

            <Button disabled={submitDisabled} variant="contained" className={classes.startButton} onClick={this._handleSubmitButton}>
              SUBMIT and return to Prolific
            </Button>
          </div>}
          
        {showEjector && <div className={classes.ejectorPage}>
          < br/>< br/>< br/>
          <Typography variant="h4">
            We have detected anomalies in your responses < br/>< br/>
            It appears that you are not performing the HIT according to our instructions < br/>< br/>
            Please return the HIT   
          </Typography> 
        </div>}
          
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(AnnotationTool);