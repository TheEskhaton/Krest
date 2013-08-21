## Krest

An early version of a javascript client-side API for Kentico 7 REST API that currently depends on SnackJS for the ajax calls and has Handlebars support.


#### Example

``` javascript
  Krest.CMS.addObject('Country');
  Krest.CMS.Country.find(271, function(country){
    console.log(country); //outputs the CMS.Country object with ID 271
  });
  Krest.Content.find('CMS.MenuItem','/community', function(doc){
    Krest.Renderer.render(doc, '.textContent h1', 'menuitem'); 
    //renders the 'doc' CMS.MenuItem to the '.textContent .h1' element using the handlebars template with id 'menuitem'
  });
```
