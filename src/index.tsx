import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import MainScreen from "./components/mainScreen";
import {LocalStorage} from "./tools/localStorage";

/**
 * @license The software is Licensed under the MIT License
 *
 * Copyright (c) Lukáš Kotlík
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * ********* Used, Licensed third party code: *********
 *
 * JSZIP - Create, read and edit .zip files with Javascript
 * Version: 3.5.0
 * https://github.com/Stuk/jszip
 * MIT License - Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
 *
 * visx - visualization components
 * visx/group - version: 1.0.0
 * visx/hierarchy - version: 1.0.0
 * visx/shape - version: 1.4.0
 * visx/responsive - version: 1.3.0
 * visx/tooltip - version: 1.3.0
 * https://github.com/airbnb/visx
 * MIT License - Copyright (c) 2017-2018 Harrison Shoff
 *
 * FileSaver.js - An HTML5 saveAs() FileSaver implementation
 * Version: 2.0.5
 * https://github.com/eligrey/FileSaver.js
 * MIT License - Copyright (c) 2016 Eli Grey
 *
 * Lodash - A modern JavaScript utility library delivering modularity, performance, & extras.
 * Version: 4.17.20
 * https://github.com/lodash/lodash
 * MIT License - Copyright JS Foundation and other contributors <https://js.foundation/>
 * Based on Underscore.js, copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
 * This software consists of voluntary contributions made by many individuals. For exact contribution history, see the revision history available at https://github.com/lodash/lodash
 *
 * React - A declarative, efficient, and flexible JavaScript library for building user interfaces.
 * Version: 16.13.1
 * https://github.com/facebook/react
 * MIT License - Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Jest - Delightful JavaScript Testing.
 * Version: 26.6.0
 * https://github.com/facebook/jest
 * MIT License - Copyright (c) Facebook, Inc. and its affiliates.
 *
 * create-react-app - Set up a modern web app by running one command.
 * Version: 3.4.1
 * https://github.com/facebook/create-react-app
 * MIT License - Copyright (c) 2013-present, Facebook, Inc.
 *
 * TypeScript - TypeScript is a superset of JavaScript that compiles to clean JavaScript output.
 * Version: 3.7.5
 * https://github.com/microsoft/TypeScript
 * Apache License 2.0
 *
 * ********* Used, not Licensed, free to use code and services: *********
 *
 * PostMail - Send email from JavaScript or static HTML without backend code
 * https://postmail.invotes.com/
 */
ReactDOM.render(
    <React.StrictMode>
        <MainScreen/>
    </React.StrictMode>,
    document.getElementById('root')
);

// sets body template by settings from local storage
document.body.classList.toggle('body-dark', LocalStorage.getDarkMode());
document.body.classList.toggle('body-light', !LocalStorage.getDarkMode());
document.body.classList.toggle('cursor-container-dark', LocalStorage.getDarkMode());
document.body.classList.toggle('cursor-container-light', !LocalStorage.getDarkMode());

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
