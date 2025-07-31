function getNotam() {
    fetch('https://lgnfme01.prod.bk.dfs/fmedatastreaming/NOTAM_TO_JSON/NOTAM_TO_JSON.fmw?SourceDataset_POSTGIS=notam_db%40adspg-azure&PARAMETER=%3CUnused%3E&DestDataset_JSON=notam.json&token=3deda2e16921c7ec22c8dc3a41b5c11a24daa577')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}