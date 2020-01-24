
function addGrade(elid, gv)
{
	var el = document.getElementById(elid);
	var v = el.value
	if ( v == "" )
	{
		v = gv
	}
	else
	{
		v = v + ","+ gv
	}
	el.value = v;
}
