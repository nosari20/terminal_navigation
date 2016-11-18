var folder = [
    {
        title : "project",
        type : "folder"
    },
    {
        title : "cv.txt",
        type : "file",
        url : "cv.txt",
    }
    ,
    {
        title : "cv.txt",
        type : "file",
        url : "cv.txt",
    }
    ,
    {
        title : "cv.txt",
        type : "file",
        url : "cv.txt",
    }
    ,
    {
        title : "cv.txt",
        type : "file",
        url : "cv.txt",
    }
    ,
    {
        title : "cv.txt",
        type : "file",
        url : "cv.txt",
    }
    ,
    {
        title : "cv.txt",
        type : "file",
        url : "cv.txt",
    }
    ,
    {
        title : "end",
        type : "file",
        url : "cv.txt",
    }

]



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
    prompt : ">",
    prog :[
        {
            command : 'ls',
            help : 'ls',
            program : function(prompt,args){
                var line = '&#09';
                for (var i = 0, len = folder.length-1; i < len; i++) {
                    var tmp = '';
                    console.log(folder[i]);
                    if(folder[i].title.length < 15){
                        for (var j = 0, len = 15 - folder[i].title.length; j < len; j++) {
                            tmp += ' ';
                        }
                    }
                    line = line + folder[i].title + '&#09' + tmp;
                    if(((i+1) % 3 == 0 ) | i == len-1){
                        prompt.out(line);
                        line = '&#09';
                    }
                    
                }              
                
            }
        }
         
    ]
});
