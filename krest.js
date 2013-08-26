(function(window, undefined){
    'use strict';
    
    var Krest = Object.create(null);

    Krest.Loader = Object.create(null);
    Krest.Loader.start = function(){};
    Krest.Loader.stop = function(){};

    Krest.CMSObject = function(objectID, objectType, dataObj){
        this.objectID = objectID;
        this.objectType = objectType;
        this.data = dataObj;
        this.get = function(fieldName){
            return this.data[fieldName];
        };
        this.render = function(elem, templateId){
            if(Krest.Renderer){
                Krest.Renderer.render(this, elem, templateId);
            }
        }
    };
    Krest.CMSObjectDefinition = function(name,parentName){
        var self = this;
        this.name = name;
        this.parentName = parentName;

        this.find = function(where,cb){
            var url = Krest.URLBuilder.build(this.parentName+'.'+this.name,where);
            Krest.Loader.start();
            var req = snack.request({
	                url: url
                }, function(err, response){
                if(err){
                    throw new Error(err);
                }
                var parsedData = JSON.parse(response).data;
                if(parsedData){
                    cb(new Krest.CMSObject(parsedData[self.name+'ID'], self.name, parsedData)); 
                }
                else{
                    cb(JSON.parse(response));
                }
                Krest.Loader.stop();
            });
        };

    };
    Krest.CMSDocument = function(nodeClassID, className, dataObj){
        this.nodeClassID = nodeClassID;
        this.className = className;
        this.data = dataObj;
        this.get = function(fieldName){
            return this.data[fieldName];
        };
        this.getChildren = function(cb){
            var url = Krest.URLBuilder.buildChildrenURL(this.get('NodeAliasPath'));
            Krest.Loader.start();
            var req = snack.request({
	                url: url
                }, function(err, response){
                if(err){
                    throw new Error(err);
                }
                cb(JSON.parse(response).cms_documents);
                Krest.Loader.stop();
            });
        };
        this.go = function(){
            if(Krest.StateManager){
                Krest.StateManager.documentState(this);
            }
        };
        this.render = function(elem, templateId){
            if(Krest.Renderer){
                Krest.Renderer.render(this, elem, templateId);
            }
        }
    };
    Krest.Namespace = function(name){
        this.name = name;
        this.addObject = function(name){
            this[name] = new Krest.CMSObjectDefinition(name, this.name);
        };
    };
    Krest.setupEndpoint = function(){
        Krest.ENDPOINT = Krest.DOMAIN + Krest.BASEPATH + '/rest/'; 
    }
    Krest.CMS = new Krest.Namespace('CMS');
    Krest.DOMAIN = window.location.protocol + "//" + window.location.host;
    Krest.BASEPATH = "";
    Krest.ENDPOINT = Krest.DOMAIN + Krest.BASEPATH + '/rest/'; 
    Krest.FORMAT = 'json';
    Krest.CULTURE = 'en-US';
    Krest.URLBuilder = {
        build : function(objectName,whereCondition){
                        if(!isNaN(whereCondition)){
                            return Krest.ENDPOINT + objectName.toLowerCase()+'/'+ whereCondition + '?format=' + Krest.FORMAT;
                        }
                        else {
                            return Krest.ENDPOINT + objectName.toLowerCase()+'/all'+ '?format=' + Krest.FORMAT+'&where='+whereCondition;

                        }
                },
        buildContentURL : function(aliasPath){
                        var url = Krest.ENDPOINT + 'content/currentsite/'+Krest.CULTURE+'/document'+ aliasPath+'?format=json';

                        return url;
                },
        buildChildrenURL : function(aliasPath){
                        var url = Krest.ENDPOINT + 'content/currentsite/'+Krest.CULTURE+'/childrenOf'+ aliasPath+'?format=json';            
                        return url;
                }
    };
    
    Krest.Content = {
        find : function(className, aliasPath, cb){
                var url = Krest.URLBuilder.buildContentURL(aliasPath);
                Krest.Loader.start();
                var req = snack.request({
	                    url: url
                    }, function(err, response){
                    if(err){
                        throw new Error(err);
                    }
                    var cleanResponse = JSON.parse(response).cms_documents[0][className.replace('.', '_')][0];
                    var doc = new Krest.CMSDocument(cleanResponse.NodeClassID, cleanResponse.ClassName, cleanResponse);
                    cb(doc);
                    Krest.Loader.stop();
                });
        }
    };
    
    Krest.on = function(selector, evt, cb){
        var elem = snack.wrap(document.querySelectorAll(selector));
        
        if(elem){
            elem.each(function(el){
                el.addEventListener(evt, cb);
            });
        }
    };
    
    if(window.Handlebars){
        Krest.Renderer = Object.create(null);
        Krest.Renderer.render = function(object,targetSelector, templateID){
            var source = document.getElementById(templateID).innerHTML;
            var template = Handlebars.compile(source);
            var html = template(object.data);
            var targetEl = document.querySelector(targetSelector);
            targetEl.innerHTML = html;
        };
    }
    
    if(window.history.pushState){
        Krest.StateManager = Object.create(null);
        Krest.StateManager.documentState = function(cmsDoc){
            var docPath = cmsDoc.get('NodeAliasPath');
            history.pushState(null, null, Krest.BASEPATH+docPath);
        };
    }
    

    window.Krest = Krest;
})(window);
