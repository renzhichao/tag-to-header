// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Simple extension to remove 'Cookie' request header and 'Set-Cookie' response
// header.

var TAGNAME="SERVER-TAG" ;

function parseUrl(url){
    var result = [];
    var query = url.split("?")[1];
    if (!query) return result ;
    var queryArr = query.split("&");
    queryArr.forEach(function(item){
        var obj = {};
        var value = item.split("=")[1];
        var key = item.split("=")[0];
        obj['key'] = key;
        obj['value'] = value;
        result.push(obj);
    });
    return result;
}

function removeHeader(url,headers, name) {
  
  var params = parseUrl(url);
  params.forEach(function(item){
    if (item['key'].toUpperCase().indexOf(name)==0){
      console.log('[WILL ADD HEADER]',{name:name,value:item['value']});
      headers.push({name:name,value:item['value']});
      return ;
    }
  });
}

function setTag(params){
  params.forEach(function(item){
    if (item['key'].toLowerCase().indexOf("tag-name")==0){
      TAGNAME = item['value'];
      return ;
    }  
  })
  
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if (details.url.indexOf("http://set-sit-tag")==0){
      setTag(parseUrl(details.url));
      return {cancel: true} ;
    }
    var name = TAGNAME;
    
    removeHeader(details.url,details.requestHeaders,name);
   
    return {requestHeaders: details.requestHeaders};
  },
  // filters
  {urls: ['https://*/*', 'http://*/*']},
  // extraInfoSpec
  ['blocking', 'requestHeaders', 'extraHeaders']);

chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    removeHeader(details.url,details.responseHeaders, TAGNAME);
    return {responseHeaders: details.responseHeaders};
  },
  // filters
  {urls: ['https://*/*', 'http://*/*']},
  // extraInfoSpec
  ['blocking', 'responseHeaders', 'extraHeaders']);
