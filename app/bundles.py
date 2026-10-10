import os
from sysconfig import get_path 
from flask_assets import Bundle

from app.routes import user
from .functions import recursive_flatten_iterator


def get_bundle(route, tpl, ext, paths, type=False):
    """
    Create a Flask-Assets Bundle for the given route, template, extension, and paths.
    
    :param route: The route for the bundle (e.g., 'js', 'css').
    :param tpl: The template for the bundle (e.g., 'js', 'css').
    :param ext: The file extension for the bundle (e.g., '.js', '.css').
    :param paths: A list of paths to include in the bundle.
    :return: A Flask-Assets Bundle object.
    """
    if route and tpl and ext:
        return {
            'instance': Bundle(*paths, output=get_path(route, tpl, ext, type), filters=get_filter(ext)),
            'name': get_filename(route, tpl, ext, type),
            'dir': os.getcwd()
        }
        
        
def register_bundle(assets, bundle):
    assets.register(bundle['name'], bundle['instance'])
    return f"Bundle {bundle['name']} registered successfully."

def register_bundles(assets, bundles):
    for x in recursive_flatten_iterator(bundles):
        for bundle in x:
            register_bundle(assets, bundle)
            
def get_filename(route, tpl, ext, type):
    if type:
        return f"{route}/{tpl}.{ext}_defer"
    else:
        return f"{route}/{tpl}.{ext}"
    
def get_path(route, tpl, ext, type):
    if type:
        return f"gen/{route}/{tpl}/main.{ext}"
    else:
        return f"gen/{route}/{tpl}/main.{ext}"
    
    
def get_filter(ext):
    return f"{ext}min"


bundles = {
    "post":{
        "all":{
            "css":[get_bundle('post', 'all', 'css', ['css/blocks/table.css' ])],
            "js":[get_bundle('post', 'all', 'js', ['js/blocks/js1.js','js/blocks/js2.js','js/blocks/js3.js' ])]
            },
        "create":{},
        "update":{}
        },
    "user":{
        "login":{},
        "register":{},
        },
}