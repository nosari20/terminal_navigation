function Directory(title){
    this.title = title;
    this.sub = [];
    this.root = null;
    this.add = function(el){
        this.sub.push(el);
        if(el instanceof Directory){
            el.root = this;
        }        
        return this;
    };
    this.findDir = function(q){
        return this.sub.find(dir => {
            return dir instanceof Directory && dir.title == q;
        });

    }
    this.find = function(q){
        return this.sub.find(dir => {
            return dir.title == q;
        });

    }

}

function File(title, url){
    this.title = title;
    if(url){
        this.url = url;
    }else{
        this.url = title;
    }
}

var root =  new Directory('')

            .add(new Directory('dev')
                .add(new File('console.md', 'dev/console.md'))
            )

            .add(new File('cv.txt'))
            
; 
var currentDirectory = root;



/*
 *  Terminal window
 */
var $terminal_window = $('.terminal-window');
var $terminal_window_open = $terminal_window.find('.control-open');
var $terminal_window_close = $terminal_window.find('.control-close');
var $terminal_window_minimize = $terminal_window.find('.control-minimize');
var $terminal_window_content = $terminal_window.find('main');

$terminal_window_open.click(function(){
    $terminal_window.removeClass('minimized').removeClass('closed');
});
$terminal_window_close.click(function(){
    $terminal_window.addClass('closed');
});
$terminal_window_minimize.click(function(){
    $terminal_window.addClass('minimized');
});



/*
 *  Terminal
 */
var $terminal = $terminal_window_content.terminal({
    prompt : '>',
    promptUser : 'admin',
    promptDir : currentDirectory.title,
    prog :[
            {
                command : 'ls',
                help : 'ls',
                program : function(prompt,args){
                    var line = '&#09';
                    for (var i = 0; i < currentDirectory.sub.length; i++) {
                        var tmp = '';
                        if(currentDirectory.sub[i].title.length < 15){
                            for (var j = 0; j < 15 - currentDirectory.sub[i].title.length; j++) {
                                tmp += ' ';
                            }
                        }
                        line = line + currentDirectory.sub[i].title + tmp;
                        if(((i+1) % 4 == 0 ) | i == currentDirectory.sub.length-1){
                            prompt.out(line);
                            line = '&#09';
                        }
                        
                    }              
                    
                }
            },
            {
                command : 'cd',
                help : 'cd [directory]',
                program : function(prompt,args){
                        if(!args[0]){
                            prompt.err('Please specify a directory.');
                            prompt.exit();
                        }else{
                            if(args[0] == '..'){
                                var dir = currentDirectory.root;
                                if(dir == undefined){
                                    prompt.err('You are already in the root directory.');
                                    prompt.exit();
                                }else{
                                currentDirectory = dir;
                                }

                            }else{
                                var dir = currentDirectory.findDir(args[0]);
                                if(dir == undefined){
                                    prompt.err('Directory <'+args[0]+'> does not exist.');
                                    prompt.exit();
                                }else{
                                    currentDirectory = dir;
                                }

                            }
                            var url = '';
                            var dir = currentDirectory;
                            while(dir.root){
                                url = dir.title + '/' + url;
                                dir = dir.root; 
                                console.log(url);
                            }
                            prompt.changeDir(url);
                            
                        }   
                    
                }
            },
            {
                command : 'cat',
                help : 'cat [file]',
                program : function(prompt,args){
                        if(!args[0]){
                            prompt.err('Please specify a file.');
                            prompt.exit();
                        }else{

                            var file = currentDirectory.find(args[0]);
                            if(file){

                                if(file instanceof File){
                                    prompt.wait();
                                    var xhr;
                                    if (window.XMLHttpRequest) {
                                        xhr = new XMLHttpRequest();
                                    } else if (window.ActiveXObject) {
                                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                                    }

                                    xhr.onreadystatechange = function(){
                                        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {

                                            prompt.out(xhr.responseText);
                                            prompt.exit();
                                        }                                
                                    };
                                    xhr.open("GET","files/"+file.url);
                                    xhr.send();
                                }else{
                                    prompt.err(args[0] +' is not a file');
                                }

                            }else{
                                prompt.err('Cannot find file ' +  args[0]);     
                            }
                                                   
                        }  
                }
            },
            {
                command : 'get',
                help : 'get [file]',
                program : function(prompt,args){
                        if(!args[0]){
                            prompt.err('Please specify a file.');
                            prompt.exit();
                        }else{

                            var file = currentDirectory.find(args[0]);
                            if(file){

                                if(file instanceof File){
                                    window.open('files/' + file.url, '_blank'); 
                                }else{
                                    prompt.err(args[0] +' is not a file');
                                }

                            }else{
                                prompt.err('Cannot find file ' +  args[0]);     
                            }
                                                   
                        }  
                }
            },

            
        ]
});
