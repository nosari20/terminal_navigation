(function ( $ ) { 
    $.terminal = function(el,options) {
        var plugin = this;
        var $el = $(el);
        var history = {
            commands : [],
            index : -1
        } 
        /*
         * default command
         */
        var prog = [
               {
                   command : "echo",
                   help : "echo [string]",
                   program : function(prompt,args){
                       var text = "";
                       for(var w in args){
                           text += (args[w] + " ");
                       }
                       prompt.out(text);
                   }
                },
                {
                   command : "whoami",
                   help : "whoami",
                   program : function(prompt,args){
                       prompt.out("Florent NOSARI");
                   }
                },
                {
                   command : "help",
                   program : function(prompt,args){
                       $.each(plugin.options.prog,function(index,value){
                           if(value.help){
                            prompt.out("- "+value.help);
                           }else{
                               prompt.out("- "+value.command);
                           }
                       });
                       
                   }
                },
                {
                   command : "moo",
                   program : function(prompt,args){
                      prompt.out("         (__)");
                      prompt.out("         (oo)");
                      prompt.out("   /------\/");
                      prompt.out("  / |    ||");
                      prompt.out(" *  /\---/\\");
                      prompt.out("    ~~   ~~");
                      prompt.out("....\"Have you mooed today?\"...");
                       
                   }
                }
        ];
        plugin.function = {
                    out : function(text, color){
                        plugin.createLine(text, color).insertBefore(plugin.prompt);
                        plugin.promptBottom();
                    },
                    err : function(text){
                        plugin.createErrorLine(text).insertBefore(plugin.prompt);
                        plugin.promptBottom();
                    },
                    clear : function(text){
                        plugin.clear();
                    },
                    clearLastLine : function(text){
                        plugin.clearLastLine();
                    },
                    in : function(callback){
                        plugin.showPrompt(false);
                        plugin.deinitPromptHandlers();
                        var enter = function(e){
                            if (e.keyCode == 13) {
                                e.preventDefault();
                                    plugin.getPromptInput().off('keypress',enter);
                                    plugin.function.out(plugin.getPromptInput().text(), 'gray');
                                    callback(plugin.getPromptInput().text());  
                                    plugin.promptBottom();
                            }
                        }
                        plugin.getPromptInput().keypress(enter);
                        plugin.function.wait();
                    },
                    exec : function(command, args){
                        var parameters = args.split(" ");
                        var prog = plugin.eval(command);
                        if(prog){
                            plugin.execute(prog.program,parameters); 
                        }   
                    },                    
                    exit : function(){
                        plugin.showPrompt();
                        plugin.initPromptHandlers();
                        plugin.autoexit = true;
                        plugin.focusPrompt();
                    },
                    wait : function(){
                        plugin.autoexit = false;
                        plugin.getPromptInput().keydown(plugin.promptCTRL_C);
                    }
        }

        /*
         * Merge options commands and defaults and delete it from optons after
         */ 
        if(options.prog){
            prog = $.merge(prog, options.prog);
            delete options.prog;
        }      
        plugin.options = $.extend({
           prog : prog,
           prompt : "$",
        }, options);        
        plugin.init = function() {
             plugin.initPrompt();
             plugin.autoexit = true;
        }
        /*
         * Prompt
         */
        plugin.initPrompt = function(){
            plugin.terminal = $(
                                '<div class="terminal">'+
                                    '<div class="comment"><pre># use \'help\' to see available commands</pre></div>'+
                                '</div>'
                            ),
            $el.append(plugin.terminal);
            plugin.prompt = plugin.createPrompt();
            plugin.terminal.append(plugin.prompt);
            plugin.terminal.click(function(){
                plugin.focusPrompt();
            })
            plugin.initPromptHandlers();
        }
        plugin.createPrompt = function(){
            return $('<div class="prompt line"><pre><span class="dollar">'+plugin.options.prompt+' </span><span contenteditable="true" class="command"></span><span class="pulse">_</span></pre></div>') ;
        }
        plugin.initPromptHandlers = function(){
            var newPrompt = plugin.createPrompt();
            plugin.prompt.replaceWith(newPrompt);
            plugin.prompt = newPrompt;
            plugin.getPromptInput().keypress(plugin.promptKeyPress);
            plugin.getPromptInput().keydown(plugin.promptKeyDown);
            plugin.getPromptInput().keydown(plugin.promptCTRL_L);
        }
        plugin.deinitPromptHandlers = function(){
            plugin.getPromptInput().off('keypress',plugin.promptKeyPress);
            plugin.getPromptInput().off('keydown',plugin.promptKeyDown);
            plugin.getPromptInput().off('keydown',plugin.promptCTRL_L);
        }
        plugin.promptCTRL_C = function(e){
            if (e.keyCode == 67 && e.ctrlKey) {
                plugin.function.exit();
            }
        }
        plugin.promptCTRL_L = function(e){
            if (e.keyCode == 76 && e.ctrlKey) {
                e.preventDefault();
                if(plugin.autoexit){
                    plugin.clear();
                    plugin.focusPrompt();
                }
            }
        }
        plugin.promptKeyPress = function(e){
            if (e.keyCode == 13) {
                e.preventDefault();                
                plugin.launch(plugin.getPromptInput().text());

            }
        }
        plugin.promptKeyDown = function(e){
            if(e.keyCode == 38){
                e.preventDefault();
                if(history.index > 0){
                    history.index -= 1;
                }
                plugin.setPrompt(history.commands[history.index]);
                plugin.focusPrompt();
            }
            if(e.keyCode == 40){
                e.preventDefault();
                if(history.index < history.commands.length){
                    history.index += 1;
                }
                plugin.setPrompt(history.commands[history.index]);
                plugin.focusPrompt();
            }
        }
        plugin.focusPrompt = function(){
            plugin.getPromptInput().focus();
            var textNode =  plugin.getPromptInput()[0].firstChild;
            if(textNode != undefined){
                var caret = textNode.length;
                var range = document.createRange();
                range.setStart(textNode, caret);
                range.setEnd(textNode, caret);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        plugin.getPromptInput = function(){
            return plugin.prompt.find('.command');
        }
        plugin.showPrompt = function(isCommand){
            plugin.emptyPrompt();
            plugin.prompt.show();
            if(isCommand == undefined){
                plugin.prompt.find('.dollar').show();
            }else{
                plugin.prompt.find('.dollar').hide();
            }
        }
        plugin.emptyPrompt = function(){
            plugin.getPromptInput().empty();
        }
        plugin.hidePrompt = function(){
            plugin.prompt.hide();
        }
        plugin.setPrompt = function(text){
            plugin.getPromptInput().text(text);
        }
        plugin.promptBottom = function(){
            setTimeout( function() {
                $($el).scrollTop($el[0].scrollHeight);
            }, 1 );
        }
        plugin.clear = function(){
            $el.find('.line').not('.prompt').remove();
        }
        plugin.clearLastLine = function(){
            $el.find('.line').not('.prompt').not('.command').last().remove();
        }
        /*
         * Creation of line
         */
        plugin.createLine = function(content, color){
            if(color){
                return $('<div class="line" style="text-shadow: 0 0 0 '+color+ '"><pre>'+content+'</pre></div>');
            }
            return $('<div class="line"><pre>'+content+'</pre></div>');
        }
        plugin.createCommandLine = function(command){
            return $('<div class="line command"><pre><span class="dollar">'+plugin.options.prompt+' </span><span class="command">'+command+'</span></pre></div>');
        }
        plugin.createErrorLine = function(content){
            return $('<div class="line error"><pre>'+content+'</pre></div>');
        }
        /*
         * Execution
         */
        plugin.launch = function(text){
            plugin.hidePrompt();
            history.commands.push(text);
            history.index = history.commands.length;
            var tab = text.split(" ");
            var command = tab.shift();
            var parameters = tab;
            plugin.createCommandLine(text).insertBefore(plugin.prompt);
            var prog = plugin.eval(command);
            if(prog){
                plugin.execute(prog.program,parameters); 
            }else{
                plugin.showPrompt();
                plugin.deinitPromptHandlers();
                plugin.initPromptHandlers();
                plugin.focusPrompt();
            }
        }
        plugin.execute = function(program,parameters){
            plugin.getPromptInput().keydown(plugin.promptCTRL_C);
            program(plugin.function, parameters);
            if(plugin.autoexit){
               plugin.function.exit();
            }

            plugin.promptBottom(); 
        }
        plugin.eval =  function(command){
            var prog = plugin.options.prog.find(prog => {
                return prog.command == command;
            })
            if(prog != undefined){
                return prog;
            }else{
                plugin.function.err("Command &lt;" + command + "&gt; not found");
                return false;
            }
        }
        plugin.init();
    };
    $.fn.terminal = function(options) {
        return this.each(function() {    
            if ($(this).attr('upgraded') == undefined) {              
                var plugin = new $.terminal(this, options);
                $(this).attr('upgraded', 'true');
            }
        });
    } 
}( jQuery ));