colorscheme delek

set nu!

set encoding=utf8

set softtabstop=4

set autoindent

filetype plugin indent on
syntax on

inoremap ' ''<ESC>ha
inoremap " ""<ESC>ha
inoremap ` ``<ESC>ha
inoremap ( ()<ESC>ha
inoremap [ []<ESC>ha
inoremap { {}<ESC>ha
inoremap /* /** */<ESC>2ha


set backspace=indent,eol,start


if &term =~ '^xterm' || has("win32") || has("win64")
    let &t_SI = "\<Esc>[6 q"
    let &t_SR = "\<Esc>[4 q"
    let &t_EI = "\<Esc>[2 q"
endif