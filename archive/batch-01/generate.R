set.seed(20261104)
out <- 'archive/batch-01'
dir.create(out, recursive=TRUE, showWarnings=FALSE)
# All data are simulated examples, not research findings.
# JAMA-inspired categorical palette; heatmap uses a muted diverging palette.
jama <- c('#374E55', '#DF8F44', '#00A1D5', '#B24745', '#79AF97', '#6A6599', '#80796B')
teal <- jama[1]; coral <- jama[2]; ink <- '#253746'; grey <- '#CAD2D8'
draw <- function(name, title, subtitle, fun) {
  render <- function() {
    par(mar=c(4,5,1,2), family='sans', col.axis=ink, col.lab=ink,
        fg=ink, las=1, cex.axis=.85, cex.lab=.95, bty='l', tcl=-.25)
    fun()
  }
  png(file.path(out,paste0(name,'.png')),width=2100,height=1650,res=300,type='cairo'); render(); dev.off()
}
groups <- rep(c('Control','Treatment A','Treatment B'),each=55)
y <- c(rnorm(55,5,1.1),rnorm(55,6.3,1),rnorm(55,7.2,1.2))
write.csv(data.frame(group=groups,value=y),file.path(out,'01-distribution-data.csv'),row.names=FALSE)
draw('01-distribution','Response distribution','Individual observations, density and median / interquartile range',function(){
 plot(NA,xlim=c(.5,3.5),ylim=range(y)+c(-.5,.5),xaxt='n',xlab='',ylab='Response (a.u.)')
 abline(h=seq(2,10,2),col='#EDF0F2',lwd=.8)
 for(i in 1:3){v<-y[((i-1)*55+1):(i*55)]; d<-density(v); w<-d$y/max(d$y)*.32; co<-jama[1:3][i]
 polygon(c(i-w,rev(i+w)),c(d$x,rev(d$x)),col=adjustcolor(co,.18),border=NA)
 points(jitter(rep(i,55),amount=.16),v,pch=16,cex=.5,col=adjustcolor(co,.55))
 q<-quantile(v,c(.25,.5,.75));segments(i,q[1],i,q[3],lwd=5,col=co);points(i,q[2],pch=21,bg='white',col=co,cex=1.1)
 };axis(1,1:3,c('Control','Treatment A','Treatment B'),tick=FALSE)
})
n<-1200; fc<-rnorm(n,0,.8); fc[1:100]<-rnorm(100,2,.5);fc[101:200]<-rnorm(100,-2,.5)
p<-2*pnorm(-abs(fc/rnorm(n, .5,.08))); fdr<-p.adjust(p,'BH'); sig<-fdr<.05 & abs(fc)>1
write.csv(data.frame(gene=paste0('Gene_',1:n),log2FC=fc,FDR=fdr),file.path(out,'02-volcano-data.csv'),row.names=FALSE)
draw('02-volcano','Differential expression','BH-adjusted P < 0.05 and absolute log2 fold change > 1',function(){
 z<--log10(pmax(fdr,1e-15));co<-ifelse(sig,ifelse(fc>0,coral,teal),grey)
 plot(fc,z,pch=16,col=adjustcolor(co,.75),cex=.55,xlab=expression(log[2]~'fold change'),ylab=expression(-log[10]~'adjusted P'),ylim=c(0,max(z)*1.18))
 abline(v=c(-1,1),h=-log10(.05),lty=2,col='#A5AFB7')
 ix<-head(order(z,decreasing=TRUE),3);text(fc[ix],z[ix],paste0('Gene_',ix),pos=3,cex=.65,col=ink)
 legend('top',c('Downregulated','Not significant','Upregulated'),pch=16,col=c(teal,grey,coral),bty='n',cex=.75)
})
labs<-c('Overall','Age < 60','Age >= 60','Female','Male','Stage I-II','Stage III-IV')
est<-c(.74,.69,.81,.71,.78,.66,.86);se<-c(.09,.15,.14,.13,.12,.16,.14);lo<-exp(log(est)-1.96*se);hi<-exp(log(est)+1.96*se)
write.csv(data.frame(subgroup=labs,HR=est,lower=lo,upper=hi),file.path(out,'03-forest-data.csv'),row.names=FALSE)
draw('03-forest','Subgroup effect estimates','Illustrative hazard ratios with 95% confidence intervals',function(){
 par(mar=c(4,7,1,2)); plot(NA,xlim=c(.4,1.5),ylim=c(.5,8),log='x',yaxt='n',xlab='Hazard ratio (log scale)',ylab='',xaxt='n')
 for(i in c(2,4,6))rect(.4,i-.45,1.5,i+.45,col='#F2F5F6',border=NA)
 abline(v=1,lty=2,col='#9DA9B2'); yy<-7:1;segments(lo,yy,hi,yy,col=teal,lwd=2);points(est,yy,pch=15,col=teal,cex=c(1.4,rep(1,6)))
 axis(2,yy,labs,tick=FALSE,cex.axis=.85);axis(1,c(.4,.6,.8,1,1.5),c('.4','.6','.8','1','1.5'))
})
mat<-matrix(rnorm(18*18),18);mat[1:9,10:18]<-mat[1:9,10:18]+2;mat[10:18,1:9]<-mat[10:18,1:9]+1.5
mat<-t(scale(t(mat)));write.csv(mat,file.path(out,'04-heatmap-data.csv'))
draw('04-heatmap','Expression signatures','Row-standardized expression / 18 genes across 18 simulated samples',function(){
 par(mar=c(4,5,1,4));pal<-colorRampPalette(c('#355C7D','#F7F5F0','#B65C50'))(100)
 image(1:18,1:18,t(mat[18:1,]),col=pal,zlim=c(-3,3),axes=FALSE,xlab='',ylab='')
 axis(1,1:18,paste0(rep(c('C','T'),each=9),rep(1:9,2)),tick=FALSE,cex.axis=.65)
 axis(2,1:18,paste0('Gene ',18:1),tick=FALSE,cex.axis=.65)
 abline(v=9.5,col='white',lwd=3);mtext('Control                 Treatment',side=1,line=1.7,cex=.85)
 for(i in 1:100)rect(19,1+(i-1)*.12,19.5,1+i*.12,col=pal[i],border=NA,xpd=NA)
 text(20,c(1,7,13),c('-3','0','3'),xpd=NA,cex=.7);text(19.4,15,'Z',xpd=NA,cex=.8)
})
time<-0:8; a<-5+.12*time; b<-5+.55*time; ci<-.35+.04*time
write.csv(data.frame(week=time,control=a,treatment=b,CI_half_width=ci),file.path(out,'05-trend-data.csv'),row.names=FALSE)
draw('05-trend','Longitudinal response','Illustrative means and 95% confidence bands (not fitted to patient data)',function(){
 plot(NA,xlim=c(0,8),ylim=c(4,10.5),xlab='Time (weeks)',ylab='Response (a.u.)');abline(h=4:10,col='#EDF0F2')
 for(i in 1:2){v<-list(a,b)[[i]];co<-c(teal,coral)[i];polygon(c(time,rev(time)),c(v-ci,rev(v+ci)),col=adjustcolor(co,.15),border=NA);lines(time,v,col=co,lwd=2);points(time,v,pch=21,bg='white',col=co,lwd=1.5,cex=.9)}
 legend('topleft',c('Control','Treatment'),col=c(teal,coral),lwd=2,pch=21,pt.bg='white',bty='n',cex=.85)
})
writeLines(capture.output(sessionInfo()),file.path(out,'session-info.txt'))




