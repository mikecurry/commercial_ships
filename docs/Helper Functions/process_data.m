clear all; load ships.mat;
fpn = zeros(41024,96);
for ii = 1:96
   
    temp2 = eval(['mau',  num2str(ii)]);
    idx = find(temp2==101);
    temp2(idx) = nan;
    temp3 = cost;
    temp3(idx) = nan;
    
     %temp = calcFPN_v2(eval(['VarName',  num2str(ii)]),VarName1/max(VarName1),0.001);
     temp = calcFPN_v2(temp2,temp3/max(temp3),1);
     idx = find(temp==101);
     temp(idx) = nan;
     fpn(:,ii) = temp/100;
     
end