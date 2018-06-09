% load FPN_his1.mat
% load FPN_his2.mat
% load('MAU1_single_era.mat')
% load('MAU2_single_era.mat')
% load('Cash_flow_single_era.mat')
% load('Acq_costs_6des.mat'); acq_cost = ans;
% load('NPVs_single_era.mat')

load('MS_FPN_single_era.mat');      FPN_history1      = squeeze(MS_FPN_single_era(:,:,:,2));
load('MS_utility_single_era.mat');  Era_epochs_MAU_1  = squeeze(MS_U__single_era(:,:,:,2));
load('MS_CF_single_era.mat');       Cash_flow_history = squeeze(MS_CF_single_era(:,:,:,2));
load('MS_NPV_single_era.mat');      NPV_single_era    = squeeze(MS_NPV_single_era(:,:,2));
load('Acq_costs_6des.mat'); acq_cost = ans;
FPN_history2 = FPN_history1;
Era_epochs_MAU_2 = Era_epochs_MAU_1;

num_designs    = size(FPN_history1,1);
num_eras       = size(FPN_history1,2);
num_time_steps = size(FPN_history1,3);
num_strategies = size(FPN_history1,4);

fpn1_average=zeros(num_designs,num_eras);
fpn2_average=zeros(num_designs,num_eras);
fpn1_volitility=zeros(num_designs,num_eras);
fpn2_volitility=zeros(num_designs,num_eras);
for ii = 1:num_designs
    for jj = 1:num_eras
        fpn1_average(ii,jj)    = sum(FPN_history1(ii,jj,:))/num_time_steps;
        fpn1_volitility(ii,jj) = sum(abs(FPN_history1(ii,jj,2:end)-FPN_history1(ii,jj,1:end-1)));
        fpn2_average(ii,jj)    = sum(FPN_history2(ii,jj,:))/num_time_steps;
        fpn2_volitility(ii,jj) = sum(abs(FPN_history2(ii,jj,2:end)-FPN_history2(ii,jj,1:end-1)));
        cash_flow_average(ii,jj)    = sum(Cash_flow_history(ii,jj,:))/num_time_steps;
        cash_flow_volitility(ii,jj) = sum(abs(Cash_flow_history(ii,jj,2:end)-Cash_flow_history(ii,jj,1:end-1)));
    end
end

data_out = zeros(num_designs*num_eras*num_time_steps, 14);
row = 0;
for ii = 1:num_designs
    for jj = 1:num_eras
        for kk = 1:num_time_steps
            row = row+1;
            data_out(row,1) = ii;
            data_out(row,2) = jj;
            data_out(row,3) = kk;
            data_out(row,4) = FPN_history1(ii,jj,kk);
            data_out(row,5) = FPN_history2(ii,jj,kk);
            data_out(row,6) = Era_epochs_MAU_1(ii,jj,kk);
            data_out(row,7) = Era_epochs_MAU_2(ii,jj,kk);
            data_out(row,8) = Cash_flow_history(ii,jj,kk);
            data_out(row,9) = acq_cost(ii);
            data_out(row,10) = NPV_single_era(ii,jj);
            %data_out(row,11) = fpn_average(ii,jj);
            %data_out(row,12) = fpn_volitility(ii,jj);
            data_out(row,11) = fpn1_average(ii,jj);
            data_out(row,12) = fpn1_volitility(ii,jj);
            data_out(row,13) = fpn2_average(ii,jj);
            data_out(row,14) = fpn2_volitility(ii,jj);
            data_out(row,15) = cash_flow_average(ii,jj);
            data_out(row,16) = cash_flow_volitility(ii,jj);
        end
    end
end

filename = 'ship_era_data.csv';
fid = fopen(filename, 'w');
fprintf(fid, 'design,era,time,fpn1,fpn2,mau1,mau2,cash_flow,acq_cost,npv,fpn1_avg,fpn1_vol,fpn2_avg,fpn2_vol,cash_avg,cash_vol\n');
fclose(fid);
%dlmwrite(filename, data_out, '-append', 'precision', '%.3f');
dlmwrite(filename, data_out, '-append');

