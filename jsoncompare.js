var fs = require("fs");

// if true, ignores case when comparing json properties
var ignoreCase = true;

var fileArgs = process.argv.slice(2);

// fileArgs.push('/Users/markmcdow/dev/Freeman/Untracked/Output/order1.json'); //file 1
// fileArgs.push('/Users/markmcdow/dev/Freeman/Untracked/Output/order2.json') //file 2
// fileArgs.push('/Users/markmcdow/dev/Freeman/Freeman.Enterprise.Invoice.Pipeline/Json-Schema/Invoiced-Order.json'); //file 1
// fileArgs.push('/Users/markmcdow/dev/Freeman/Untracked/Output/cbs_no_kafka1.json'); //file 2

if (fileArgs.length < 2) {
    console.log('\n');
    console.log('Please provide two file names to compare');
    console.log('\n');
    console.log('Example usage: node jsoncompare.js file1.json file2.json');
    console.log('\n');
    return;
}

//var file1 = 'Invoiced-Order.json';
var file1name = fileArgs[0];
var file2name = fileArgs[1];

var file1 = fs.readFileSync(file1name);
var file2 = fs.readFileSync(file2name);

var object1 = JSON.parse(file1.toString());
var object2 = JSON.parse(file2.toString());

var file1map = new Map();
var file2map = new Map();

var printTitle = (text) => {
    let line = '';
    let wing = (88 - text.length) / 2;        
    for(let x = 0; x < wing; x++) {
        line += '-';
    }
    line += ' ' + text + ' ';
    for(let x = 0; x < wing-(text.length % 2); x++) {
        line += '-';
    }
    return line;
}

var objectMapper = (parentPath,obj,isArray,map) => {    
    for(let prop in obj) {        
        let currentPath = isArray ? '' : `/${ignoreCase ? prop.toLowerCase() : prop}`;
        if ((typeof
             obj[prop] === 'object') ) {            
            objectMapper(`${parentPath}${currentPath}`,obj[prop],Array.isArray(obj[prop]),map);
        }        
        else map.set(`${parentPath}${currentPath}`,"")        
    }
}

var customSort = (a,b) => {
    let depthA = a.match(/\//g).length;
    let depthB = b.match(/\//g).length; 
    let depthDiff = depthA-depthB;            
    if (depthDiff == 0) {            
        return a.toLowerCase().replace(/\//g,'').localeCompare(b.toLowerCase().replace(/\//g,''));
    }
    else {        
        return depthDiff;
    }    
}

var printObject = (map) => {
    let filePaths = Array.from(map.keys());
    filePaths.sort(customSort);
    for(let path in filePaths) {
        console.log(filePaths[path]);
    }
}


objectMapper('',object1,false,file1map);
objectMapper('',object2,false,file2map);


// main application flow
console.log('\n');
console.log('\n');
console.log(printTitle(file1name.split('/').pop()));
printObject(file1map);
console.log('\n');
console.log(printTitle(file2name.split('/').pop()));
printObject(file2map);
console.log('\n');
console.log(printTitle(`In ${file1name.split('/').pop()}, not in ${file2name.split('/').pop()}`));
for(let path of file1map.keys()) {    
    if (file2map.get(path) === undefined) {
        console.log(path);
    }
}
console.log('\n');
console.log(printTitle(`In ${file2name.split('/').pop()}, not in ${file1name.split('/').pop()}`));
for(let path of file2map.keys()) {    
    if (file1map.get(path) === undefined) {
        console.log(path);
    }
}
console.log('\n');