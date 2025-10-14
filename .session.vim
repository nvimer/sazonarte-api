let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/Documents/work/ngcraftz/sazonarteApp/server
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +29 docs/profiles/post.yaml
badd +14 docs/auth/post.yaml
badd +36 docs/menus/items/post.yaml
badd +152 docs/menus/categories/schemas/components.yaml
badd +11 docs/profiles/schemas/components.yaml
badd +40 src/api/v1/profiles/profile.validator.ts
badd +100 docs/auth/schemas/components.yaml
badd +0 docs/menus/categories/schemas/menu-category.yaml
badd +22 docs/profiles/schemas/profile.yaml
argglobal
%argdel
$argadd .
edit docs/profiles/schemas/profile.yaml
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
wincmd _ | wincmd |
split
1wincmd k
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
wincmd =
argglobal
balt docs/profiles/schemas/components.yaml
setlocal foldmethod=manual
setlocal foldexpr=0
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
silent! normal! zE
let &fdl = &fdl
let s:l = 22 - ((21 * winheight(0) + 27) / 55)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 22
normal! 031|
lcd ~/Documents/work/ngcraftz/sazonarteApp/server
wincmd w
argglobal
if bufexists(fnamemodify("~/Documents/work/ngcraftz/sazonarteApp/server/docs/menus/categories/schemas/menu-category.yaml", ":p")) | buffer ~/Documents/work/ngcraftz/sazonarteApp/server/docs/menus/categories/schemas/menu-category.yaml | else | edit ~/Documents/work/ngcraftz/sazonarteApp/server/docs/menus/categories/schemas/menu-category.yaml | endif
if &buftype ==# 'terminal'
  silent file ~/Documents/work/ngcraftz/sazonarteApp/server/docs/menus/categories/schemas/menu-category.yaml
endif
balt ~/Documents/work/ngcraftz/sazonarteApp/server/docs/menus/categories/schemas/components.yaml
setlocal foldmethod=manual
setlocal foldexpr=0
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
silent! normal! zE
let &fdl = &fdl
let s:l = 17 - ((4 * winheight(0) + 13) / 27)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 17
normal! 0
lcd ~/Documents/work/ngcraftz/sazonarteApp/server
wincmd w
argglobal
if bufexists(fnamemodify("~/Documents/work/ngcraftz/sazonarteApp/server/src/api/v1/profiles/profile.validator.ts", ":p")) | buffer ~/Documents/work/ngcraftz/sazonarteApp/server/src/api/v1/profiles/profile.validator.ts | else | edit ~/Documents/work/ngcraftz/sazonarteApp/server/src/api/v1/profiles/profile.validator.ts | endif
if &buftype ==# 'terminal'
  silent file ~/Documents/work/ngcraftz/sazonarteApp/server/src/api/v1/profiles/profile.validator.ts
endif
balt ~/Documents/work/ngcraftz/sazonarteApp/server/docs/menus/categories/schemas/components.yaml
setlocal foldmethod=manual
setlocal foldexpr=0
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
silent! normal! zE
let &fdl = &fdl
let s:l = 40 - ((17 * winheight(0) + 13) / 27)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 40
normal! 044|
lcd ~/Documents/work/ngcraftz/sazonarteApp/server
wincmd w
3wincmd w
wincmd =
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
