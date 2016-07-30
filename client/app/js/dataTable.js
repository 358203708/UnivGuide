//dataTable
var dataTable;
d3.csv('../data/Times_University_Ranking.csv', function (error, data) {
    data.forEach(function (d) {
        // d.dd = dateFormat.parse(d["Start_Date"]);
        // d.year = +yearFormat(d.dd);
        d.universityName = d["University"];
    });
    var ndx = crossfilter(data);
    var universityNameDim = ndx.dimension(function (d) {
            return d["University"];
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
                    "data": "Rank"
                    , "defaultContent": ""
      }, {
                    "data": "Last Year Rank"
                    , "defaultContent": ""
    }, {
                    "data": "University"
                    , "defaultContent": ""
  }, {
                    "data": "Teaching quality (%)"
                    , "defaultContent": ""
}, {
                    "data": "Student experience (%)"
                    , "defaultContent": ""
}, {
                    "data": "Research quality (%)"
                    , "defaultContent": ""
}, {
                    "data": "Graduate prospects (%)"
                    , "defaultContent": ""
}, {
                    "data": "Firsts/2:1s (%)"
                    , "defaultContent": ""
},{
                    "data": "Completion rate (%)"
                    , "defaultContent": ""
},
{
                    "data": "Student-staff ratio"
                    , "defaultContent": ""
},
{
                    "data": "Services/ facilities spend (pounds)"
                    , "defaultContent": ""
},{
                    "data": "Total"
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
