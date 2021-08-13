

let browsers = document.getElementById('browsers');
let entrada = document.getElementById('browser');


//================== funcion carga datos dep ==============//
//========================================================//
let jsonColombia;
let departamentos;
let reporteCovid;

(async () => {
    const res = await fetch('https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json')
    jsonColombia = await res.json();
    jsonColombia.features.forEach(element => {
        browsers.innerHTML += `<option value="${element.properties.NOMBRE_DPT}">`;
    });
})();


(async () => {
    const res = await fetch('https://www.datos.gov.co/resource/gt2j-8ykr.json');
    reporteCovid = await res.json();    
})();


//================== funcion initMap ==============//
//=================================================//

let map;
let mapaDepartamento;
let infoWindow;
let propiedadesDepartamento;


async function initMap() {

    // crear infowindow
    infoWindow = new google.maps.InfoWindow({
        position: { lat: 4.6097100, lng: -85.0817500 },
        map,
        shouldFocus: false,
        //content: departamentFeatures
    });

    //crear objeto map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 4.6097100, lng: -74.0817500 },
        zoom: 5,
    });

    //crear objeto loadGeoJson
    mapaColombia = new google.maps.Data();
    mapaColombia.loadGeoJson(
        "https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json"
    );
    mapaColombia.setStyle({    
        fillColor: 'rgb(19, 108, 224)'
    });
    mapaColombia.setMap(map)
    

    let poligonoDepartamento = [];

    // crea objeto Polygon
    mapaDepartamento = new google.maps.Polygon({
        //paths: poligonoDepartamento,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
    });

    entrada.addEventListener('change', () => {
        infoWindow.close()
        mapaColombia.setMap(null)
        mapaDepartamento.setMap(null)
        poligonoDepartamento = []

        let coordenadas = [];

        const departamento = browser.value;
        casosCovid(departamento);

        jsonColombia.features.forEach(item => {
            if (item.properties.NOMBRE_DPT == departamento) {
                propiedadesDepartamento = {
                    AREA: item.properties.AREA,
                    NOMBRE_DPT: item.properties.NOMBRE_DPT,
                    DPTO: item.properties.DPTO,
                    HECTARES: item.properties.HECTARES,
                    PERIMETER: item.properties.PERIMETER

                }

                item.geometry.coordinates[0].forEach(item => {
                    coordenadas.push({ lat: parseFloat(item[1]), lng: parseFloat(item[0]) })
                });

                poligonoDepartamento.push(coordenadas)
                coordenadas = [];
            }
            if (departamento == 'COLOMBIA' || departamento == '') {
                mapaColombia.setMap(map)
                mapaDepartamento.setMap(null)
                poligonoDepartamento = []
            }
        });



        mapaDepartamento.setPaths(poligonoDepartamento);
        mapaDepartamento.setMap(map);

    });

    mapaDepartamento.addListener('mouseover', individualDepartamentChoice);
    map.data.addListener("mouseover", departamentChoice);
    mapaColombia.addListener('mouseover', departamentChoice);
}

//========= funcion elegir departamento ===========//
//=================================================//

function departamentChoice(event) {
    
    const departamentFeatures = `
    <table class="table table-bordered">
        <tbody>                      
            <tr>
                <th scope="row">DPTO</th>
                <td>${event.feature.i.DPTO}</td>                                                          
            </tr>
            <tr>
                <th scope="row">NOMBRE_DPT</th>
                <td>${event.feature.i.NOMBRE_DPT}</td>                                                         
            </tr>
            <tr>
                <th scope="row">AREA</th>
                <td>${event.feature.i.AREA}</td>                                                           
            </tr>
            <tr>
                <th scope="row">PERIMETER</th>
                <td>${event.feature.i.PERIMETER}</td>                                                           
            </tr>
            <tr>
                <th scope="row">HECTARES</th>
                <td>${event.feature.i.HECTARES}</td>                                                          
            </tr>
        
        </tbody>
    </table>
`;
    infoWindow.setContent(departamentFeatures);
    infoWindow.open(map);

}

//========= funcion elegir departamento Individual ===========//
//============================================================//

function individualDepartamentChoice(event) {
    
    const departamentFeatures = `
    <table class="table table-bordered">
        <tbody>                      
            <tr>
                <th scope="row">DPTO</th>
                <td>${propiedadesDepartamento.DPTO}</td>                                                          
            </tr>
            <tr>
                <th scope="row">NOMBRE_DPT</th>
                <td>${propiedadesDepartamento.NOMBRE_DPT}</td>                                                         
            </tr>
            <tr>
                <th scope="row">AREA</th>
                <td>${propiedadesDepartamento.AREA}</td>                                                           
            </tr>
            <tr>
                <th scope="row">PERIMETER</th>
                <td>${propiedadesDepartamento.PERIMETER}</td>                                                           
            </tr>
            <tr>
                <th scope="row">HECTARES</th>
                <td>${propiedadesDepartamento.HECTARES}</td>                                                          
            </tr>
        
        </tbody>
    </table>
`;
    infoWindow.setContent(departamentFeatures);
    infoWindow.open(map);
}

//= funcion cuanta casos mortales, activos, recuperados =//
//=======================================================//

function casosCovid(departamento) {
    
    let activos = 0;
    let recuperados = 0;
    let mortales = 0;
    let totales = 0;
    let fechaRecuperado;
    reporteCovid.forEach(item => {
        if (item.departamento_nom == departamento) {
            totales++;
            item.recuperado == 'Recuperado' ? recuperados++ : recuperados += 0;
            item.recuperado == 'Fallecido' ? mortales++ : mortales += 0;
            item.recuperado == 'N/A' ? activos++ : activos += 0;
            fechaRecuperado = item.fecha_recuperado;
        }
    });
    document.getElementById('recuperados').innerHTML = recuperados;
    document.getElementById('mortales').innerHTML = mortales;
    document.getElementById('activos').innerHTML = activos;
    document.getElementById('totales').innerHTML = totales;
    document.getElementById('fecharecuperado').innerHTML = fechaRecuperado;

}

