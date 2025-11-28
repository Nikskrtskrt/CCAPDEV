const isAuthenticated = (requiredRole)=>{
    return function(req, res, next){
        if(!req.session.user){
            if(req.originalUrl.startsWith('/api')){
                return res.status(401).json({error: 'Unauthorized: Please login first'});
            }
            return res.redirect('/login');
        }
        if(requiredRole && req.session.user.role !== requiredRole){
            if(req.originalUrl.startsWith('/api')){
                return res.status(401).json({error: 'Forbidden: Insufficient Role'});
            }
            return res.status(403).json({error: 'You do not have the sufficient role'});
        }
        next();
    };
};

const hasPermission = (requiredPermission)=>{
    return function(req, res, next){
        const userPermissions = req.session.user.permissions || [];

        if(userPermissions.includes(requiredPermission)){
            next();
        }else{
            if(req.originalUrl.startsWith('/api')){
                return res.status(401).json({error: 'Unauthorized: Please login first'});
            }
            return res.status(403).json({error: 'You do not have the sufficient perms'});
        }
    };
};

module.exports = {isAuthenticated, hasPermission};
