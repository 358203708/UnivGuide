//dataTable
var dataTable;
d3.csv('../data/university_ranking_2016.csv', function (error, data) {
    data.forEach(function (d) {
        // d.dd = dateFormat.parse(d["Start_Date"]);
        // d.year = +yearFormat(d.dd);
        d.universityName = d["university_name"];
    });
    var ndx = crossfilter(data);
    var universityNameDim = ndx.dimension(function (d) {
            return d["university_name"];
        })
        , dataTable = $('#data-table').dataTable({
            "bJQueryUI": true
            , "sPaginationType": "full_numbers"
            , "bPaginate": true
            , "bLengthChange": true
            , "bFilter": true
            , "bSort": true
            , "bInfo": true
            , "sInfoPostFix": true
            , "aaData": universityNameDim.top(Infinity)
            , "bAutoWidth": true
            , "bProcessing": true
            , "aoColumns": [{
                    "data": "ranking"
                    , "defaultContent": ""
      }, {
                    "data": "university_name"
                    , "defaultContent": ""
    }, {
                    "data": "teaching"
                    , "defaultContent": ""
  }, {
                    "data": "international"
                    , "defaultContent": ""
}, {
                    "data": "research"
                    , "defaultContent": ""
}, {
                    "data": "citations"
                    , "defaultContent": ""
}, {
                    "data": "income"
                    , "defaultContent": ""
}, {
                    "data": "total_score"
                    , "defaultContent": ""
}

//                    {
//  "data": "num_students",
//  "defaultContent": ""
//},{
//  "data": "student_staff_ratio",
//  "defaultContent": ""
//},{
//  "data": "international_students",
//  "defaultContent": ""
//}
//


]
        });
});