(function(window, undefined){
    'use strict';
    
    var Krest = Object.create(null);
    
    Krest.CMSObject = function(objectID, objectType, dataObj){
        this.objectID = objectID;
        this.objectType = objectType;
        this.data = dataObj;
        this.get = function(fieldName){
            return this.data[fieldName];
        }
    }
    Krest.CMSObjectDefinition = function(name,parentName){
        var self = this;
        this.name = name;
        this.parentName = parentName;

        this.find = function(where,cb){
            var url = Krest.URLBuilder.build(this.parentName+'.'+this.name,where);
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
            });
        }
    };
    Krest.CMSDocument = function(nodeClassID, className, dataObj){
        this.nodeClassID = nodeClassID;
        this.className = className;
        this.data = dataObj;
        this.get = function(fieldName){
            return this.data[fieldName];
        }
        this.getChildren = function(cb){
            var url = Krest.URLBuilder.buildChildrenURL(this.get('NodeAliasPath'));
            var req = snack.request({
	                url: url
                }, function(err, response){
                if(err){
                    throw new Error(err);
                }
                
                cb(JSON.parse(response).cms_documents);
            });
        }
    };
    Krest.Namespace = function(name){
        this.name = name;
        this.addObject = function(name){
            this[name] = new Krest.CMSObjectDefinition(name, this.name);
        }
    };
    Krest.CMS = new Krest.Namespace('CMS');
    Krest.DOMAIN = window.location.protocol + "//" + window.location.host;
    Krest.ENDPOINT = Krest.DOMAIN + '/rest/'; 
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
                var req = snack.request({
	                    url: url
                    }, function(err, response){
                    if(err){
                        throw new Error(err);
                    }
                    var cleanResponse = JSON.parse(response).cms_documents[0][className.replace('.', '_')][0];
                    var doc = new Krest.CMSDocument(cleanResponse.NodeClassID, cleanResponse.ClassName, cleanResponse);
                    cb(doc);
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
        }
    }

    window.Krest = Krest;
})(window);
