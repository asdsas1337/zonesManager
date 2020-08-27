class zonesManager {
    constructor() {
        this.registered = [];
        this.localPlayer = mp.players.local;

        mp.events.add( 'render', () => {
            this.registered.forEach( zoneObject => {

                if( this.localPlayer.dimension != 0 ) {
                    if ( zoneObject.collieded ) {
                        mp.events.call( 'client::playerZone:exit', this.localPlayer, zoneObject.zoneName );
                        mp.events.callRemote( 'server::playerZone:exit', zoneObject.zoneName );

                        zoneObject.collieded = false;
                    }
                } else {
                    let pointInside = [ this.localPlayer.position.x, this.localPlayer.position.y ],
                        vectorsArray = [];

                    for ( let i in zoneObject.vectors ) {
                        let vectorObject = zoneObject.vectors[i];
                        vectorsArray.push( [vectorObject.x, vectorObject.y] );
                    }

                    if( this.pointInCoords(pointInside, vectorsArray) ) {
                        if( !zoneObject.collieded ) {
                            mp.events.call( 'client::playerZone:enter', this.localPlayer, zoneObject.zoneName );
                            mp.events.callRemote( 'server::playerZone:enter', zoneObject.zoneName );

                            zoneObject.collieded = true;
                        }
                    } else {
                        if ( zoneObject.collieded ) {
                            mp.events.call( 'client::playerZone:exit', this.localPlayer, zoneObject.zoneName );
                            mp.events.callRemote( 'server::playerZone:exit', zoneObject.zoneName );

                            zoneObject.collieded = false;
                        }
                    }
                }
            });
        });
    }

    pointInCoords( point, vs ) {
        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    getZoneByName( zoneName ) {
        for ( let i in this.registered ) {
            let zoneObject = this.registered[i];
            if( zoneObject.zoneName === zoneName ) return zoneObject;
        }
        return undefined;
    }

    registerZone( vectors, height, zoneName ) {
        let zoneObject = {};

        zoneObject.vectors = vectors;
        zoneObject.height = height;
        zoneObject.collieded = false;
        zoneObject.zoneName = zoneName;
        zoneObject.data = {};

        this.registered.push(zoneObject);
        return zoneObject;
    }

    isPointInZone( point, zoneName ) {
        for ( let i in this.registered ) {

            let zoneObject = this.registered[i];

            if ( zoneObject.zoneName === zoneName ) {
                let pointInside = [point.x, point.y],
                    vectorCoords = [];

                for ( let i in zoneObject.vectors ) {
                    let vectorObject = zoneObject.vectors[i];
                    vectorCoords.push( [vectorObject.x, vectorObject.y] );
                }

                return pointInCoords( pointInside, vectorCoords ); 
            }

        }
    }

    drawZone( vectorsArray, height ) {
        mp.events.add( 'render', () => {
            for ( let i in vectorsArray ) {

                if ( i != parseInt( vectorsArray.length, 10 ) - 1 ) {
                    i = parseInt(i, 10);
                
                    let currentVector = vectorsArray[i],
                        currentVectorUp = { x: currentVector.x, y: currentVector.y, z: parseFloat( height ) },

                        nextVector = vectorsArray[i + 1],
                        nextVectorUp = { x: nextVector.x, y: nextVector.y, z: parseFloat( height ) };

                    lib.graphics.drawLine( currentVector.x, currentVector.y, currentVector.z, nextVector.x, nextVector.y, nextVector.z, 255, 0, 0, 255 );
                    lib.graphics.drawLine( currentVector.x, currentVector.y, currentVector.z, currentVectorUp.x, currentVectorUp.y, currentVectorUp.z, 255, 0, 0, 255 );
                    lib.graphics.drawLine( nextVector.x, nextVector.y, nextVector.z, nextVectorUp.x, nextVectorUp.y, nextVectorUp.z, 255, 0, 0, 255 );
                    lib.graphics.drawLine( currentVectorUp.x, currentVectorUp.y, currentVectorUp.z, nextVectorUp.x, nextVectorUp.y, nextVectorUp.z, 255, 0, 0, 255 );
                } else {
                    let currentVector = vectorsArray[i],
                        currentVectorUp = { x: currentVector.x, y: currentVector.y, z: parseFloat( height ) },

                        nextVector = vectorsArray[0],
                        nextVectorUp = { x: nextVector.x, y: nextVector.y, z: parseFloat( height ) };

                    lib.graphics.drawLine( currentVector.x, currentVector.y, currentVector.z, nextVector.x, nextVector.y, nextVector.z, 255, 0, 0, 255 );
                    lib.graphics.drawLine( currentVector.x, currentVector.y, currentVector.z, currentVectorUp.x, currentVectorUp.y, currentVectorUp.z, 255, 0, 0, 255 );
                    lib.graphics.drawLine( nextVector.x, nextVector.y, nextVector.z, nextVectorUp.x, nextVectorUp.y, nextVectorUp.z, 255, 0, 0, 255 );
                    lib.graphics.drawLine( currentVectorUp.x, currentVectorUp.y, currentVectorUp.z, nextVectorUp.x, nextVectorUp.y, nextVectorUp.z, 255, 0, 0, 255 );
                }

            }
        });
    }
}